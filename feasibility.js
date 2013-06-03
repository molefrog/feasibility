// Auxilirary functions
function gcd(a, b) {
    var t;
    while (b != 0){
        t = b;
        b = a % b;
        a = t;
    }
    return a;
};

function lcm(a, b) {
    return (a * b / gcd(a, b));
};

function sum(a, b) {
	return a + b;
};	


// Function returns busy period of task set
function busy_period(tasks) {
	function busy_period_rec(l) {
		var nextl = _.chain(tasks)
			.map(function(t) {
				return Math.ceil(l / t.T) * t.C;
			})
			.foldl(sum, 0)
			.value();

		if(nextl === l) return l;
		return arguments.callee(nextl);
	};

	var startl = _.chain(tasks)
		.map(function(t) { return t.C; })
		.foldl(sum, 0)
		.value();

	return busy_period_rec(startl);
};

// Function returns utilization for every task in task set
function utilization(tasks) {
	return _(tasks).map(function(t) { 
		return t.C / t.T 
	});
}

// Function performs feasibility check for RM 
// (Deadline Monotonic) scheduler
function check_dm(tasks) {
	// Calculation of utilization for every task and the whole set
	var Us = utilization(tasks);
	var U  = _(Us).foldl(sum, 0);

	// If utilization > 1, task definetely not feasible
	if(U > 1) return false;


	function responce_time_check(e) {
		var tasks_ = this;

		// Basically, responce time is a fixed point 
		// of following recursive formula
		function responce_time(r) {
			var nextr = e.C + 
				_.chain(tasks_)
					// Sum including every task with 
					// less dealine that current task
					.filter(function(t) {
						return t.D < e.D;
					})
					.map(function(t) {
						return Math.ceil(r / t.T) * t.C;
					})
					.foldl(sum, 0)
					.value();

			if(nextr === r) return r;
			return arguments.callee(nextr);
		};

		// Worst case responce time should be <= relative
		// deadline (Audsley, 1993)
		return responce_time(e.C) <= e.D;
	};

	// Task set is feasible if and only if every task 
	// satisfies responce time check
	return _(tasks).every(responce_time_check, tasks);
};


// Function calculates processor demand function for
// given tasks set, using given set of points as input
function processor_demand(tasks, interval) {
	return _(interval).map(function(t) {
		var ht = _.chain(tasks)
			.filter(function(task) {
				return task.D <= t;
			})
			.map(function(task) {
				return Math.floor((t + task.T - task.D) / task.T) 
					* task.C;
			})
			.foldl(sum, 0)
			.value();

		return [t, ht];
	});
}

// Function performs feasibility check for EDF
// (Earliest Deadline First) scheduler
function check_edf(tasks) {
	// Calculation of utilization for every task and the whole set
	var Us = utilization(tasks);
	var U  = _(Us).foldl(sum, 0);

	// If utilization > 1, task definetely not feasible
	if(U > 1) return false;

	// Finding L - boundary for feasibility check
	// In common case it is hyperperiod, but we are 
	// using more optimal boundary (Spuri, 1995)
	var La_ = _.chain(tasks)
		.map(function(t, i) {
			return Us[i] * (t.T - t.D); 
		})
		.foldl(sum, 0)
		.value() / (1 - U);

	var La = _.chain(tasks)
		.map(function(t) { return t.D; })
		.union([La_])
		.max()
		.value();	


	var Lb = busy_period(tasks);
	var L = _([La, Lb]).min();

	// Set D consists of all posible absolute deadlines, 
	// which are located between 0 and L.
	// This helps us to check feasibility condition without 
	// iterating over all points (be default it's infinite)
	var D = [];
	for(var m = 0;; ++m) {
		var newD = _.chain(tasks)
			.map(function(t) {
				return m * t.T + t.D;
			})
			.filter(function(x) {
				return x <= L;
			})
			.value();

		if(_(newD).isEmpty()) break;
		D = _(D).union(newD);
	}

	// Task set is feasible EDF, if and only if:
	// for every point t from D: h(t) <= t 
	return _(processor_demand(tasks, D)).every(function(x) {
		return x[1] <= x[0]
	});
};	