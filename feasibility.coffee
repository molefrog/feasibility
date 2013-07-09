# Greatest Common Divisor
gcd = (numbers...) ->
  numbers.reduce (n, m) ->
    if m == 0 then n else gcd(m, n % m) 

# Least Common Multiple
lcm = (numbers...) -> 
  numbers.reduce (n, m) -> 
    n * m / gcd(n, m)

sum = (a, b) -> a + b

console.log lcm 21, 6

# Function returns busy period of task set
# busy_period = (tasks) ->
#   busy_period_rec = (l) ->
#     nextl = _.chain(tasks).map((t) ->
#       Math.ceil(l / t.T) * t.C
#     ).foldl(sum, 0).value()
#     return l  if nextl is l
#     arguments_.callee nextl
#   startl = _.chain(tasks).map((t) ->
#     t.C
#   ).foldl(sum, 0).value()
#   busy_period_rec startl

# # Function returns utilization for every task in task set
# utilization = (tasks) ->
#   _(tasks).map (t) ->
#     t.C / t.T


# # Function performs feasibility check for RM 
# # (Deadline Monotonic) scheduler
# check_dm = (tasks) ->
  
#   # Calculation of utilization for every task and the whole set
  
#   # If utilization > 1, task definetely not feasible
#   responce_time_check = (e) ->
    
#     # Basically, responce time is a fixed point 
#     # of following recursive formula
#     responce_time = (r) ->
      
#       # Sum including every task with 
#       # less dealine that current task
#       nextr = e.C + _.chain(tasks_).filter((t) ->
#         t.D < e.D
#       ).map((t) ->
#         Math.ceil(r / t.T) * t.C
#       ).foldl(sum, 0).value()
#       return r  if nextr is r
#       arguments_.callee nextr
#     tasks_ = this
    
#     # Worst case responce time should be <= relative
#     # deadline (Audsley, 1993)
#     responce_time(e.C) <= e.D
#   Us = utilization(tasks)
#   U = _(Us).foldl(sum, 0)
#   return false  if U > 1
  
#   # Task set is feasible if and only if every task 
#   # satisfies responce time check
#   _(tasks).every responce_time_check, tasks

# # Function calculates processor demand function for
# # given tasks set, using given set of points as input
# processor_demand = (tasks, interval) ->
#   _(interval).map (t) ->
#     ht = _.chain(tasks).filter((task) ->
#       task.D <= t
#     ).map((task) ->
#       Math.floor((t + task.T - task.D) / task.T) * task.C
#     ).foldl(sum, 0).value()
#     [t, ht]


# # Function performs feasibility check for EDF
# # (Earliest Deadline First) scheduler
# check_edf = (tasks) ->
  
#   # Calculation of utilization for every task and the whole set
#   Us = utilization(tasks)
#   U = _(Us).foldl(sum, 0)
  
#   # If utilization > 1, task definetely not feasible
#   return false  if U > 1
  
#   # Finding L - boundary for feasibility check
#   # In common case it is hyperperiod, but we are 
#   # using more optimal boundary (Spuri, 1995)
#   La_ = _.chain(tasks).map((t, i) ->
#     Us[i] * (t.T - t.D)
#   ).foldl(sum, 0).value() / (1 - U)
#   La = _.chain(tasks).map((t) ->
#     t.D
#   ).union([La_]).max().value()
#   Lb = busy_period(tasks)
#   L = _([La, Lb]).min()
  
#   # Set D consists of all posible absolute deadlines, 
#   # which are located between 0 and L.
#   # This helps us to check feasibility condition without 
#   # iterating over all points (be default it's infinite)
#   D = []
#   m = 0

#   loop
#     newD = _.chain(tasks).map((t) ->
#       m * t.T + t.D
#     ).filter((x) ->
#       x <= L
#     ).value()
#     break  if _(newD).isEmpty()
#     D = _(D).union(newD)
#     ++m
  
#   # Task set is feasible EDF, if and only if:
#   # for every point t from D: h(t) <= t 
#   _(processor_demand(tasks, D)).every (x) ->
#     x[1] <= x[0]
