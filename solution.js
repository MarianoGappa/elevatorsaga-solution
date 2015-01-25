{
    init: function(elevators, floors) {
        for(i=0; i<elevators.length; i++) {
            elevators[i].on("idle", function() {
                if(this.currentFloor() > 0)
                    this.goToFloor(this.currentFloor() - 1)
            })
            elevators[i].on("floor_button_pressed", function(floorNum) {
                if(this.destinationQueue.indexOf(floorNum) == -1) {
                    this.goToFloor(floorNum)
                    sortElevatorQueue(this)
                    this.checkDestinationQueue();
                }
            })
        }

        for(i=0; i<floors.length; i++) {
            floors[i].on("up_button_pressed", function() {
                floorButtonPressed(this, 1)
            })
            floors[i].on("down_button_pressed", function() {
                floorButtonPressed(this, -1)
            })
        }

        function floorButtonPressed(floor, direction) {
            var num = closestElevator(floor.floorNum(), direction);
            var elev = elevators[num];
            if(elev.destinationQueue.indexOf(floor.floorNum()) == -1) {
                elev.goToFloor(floor.floorNum())
                sortElevatorQueue(elev);
                elev.checkDestinationQueue();
            }
        }

        function closestElevator(floorNum, direction) {
            var chosen = [Math.floor(Math.random() * elevators.length)];
            var minabs = 10;
            for(i=0; i<elevators.length; i++) {
                var curElev = elevators[i];
                var curFloor = curElev.currentFloor();

                if(curElev.loadFactor() <= 0.7) {
                    if(
                        (curElev.goingUpIndicator() && direction == 1 && curFloor <= floorNum)
                        ||
                        (curElev.goingDownIndicator() && direction == -1 && curFloor >= floorNum)
                    ) {

                        var abs = Math.abs(curFloor-floorNum);
                        if(abs < minabs) {
                            minabs = abs
                            chosen = [i]
                        } else if(abs == minabs) {
                            chosen.push(i)
                        }
                    }
                }
            }

            return chosen[Math.floor(Math.random() * chosen.length)];
        }

        function sortElevatorQueue(e) {
            var cur = e.currentFloor();
            e.destinationQueue.sort(function (a, b) { 
                if(a==b) return 0;

                if(e.goingUpIndicator() && a >= cur && b < cur)
                    return -1;
                if(e.goingUpIndicator() && a < cur && b >= cur)
                    return 1;

                if(e.goingDownIndicator() && a <= cur && b > cur)
                    return -1;
                if(e.goingDownIndicator() && a > cur && b <= cur)
                    return 1;

                var diffA = Math.abs(cur-a);
                var diffB = Math.abs(cur-b);

                return diffA-diffB;
            })
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
        updateIndicators(elevators, floors)

       function updateIndicators(elevators, floors) {
            for(it=0; it<elevators.length; it++) {
                var curElev = elevators[it]
                var curFloor = curElev.currentFloor();

                if(curFloor == 0) {
                    curElev.goingUpIndicator(true);
                    curElev.goingDownIndicator(false);
                } else if(curFloor == floors.length) {
                    curElev.goingUpIndicator(false);
                    curElev.goingDownIndicator(true);
                } else if(curElev.destinationQueue.length == 0) {
                    curElev.goingUpIndicator(true);
                    curElev.goingDownIndicator(true);                    
                } else if(curElev.goingUpIndicator() && curFloor < maxInQueue(curElev)) {
                    curElev.goingDownIndicator(false);
                } else if(curElev.goingDownIndicator() && curFloor > minInQueue(curElev)) {
                    curElev.goingUpIndicator(false);
                } else {
                    if (curFloor >= maxInQueue(curElev))
                        curElev.goingDownIndicator(true);
                    if(curFloor <= minInQueue(curElev))
                        curElev.goingUpIndicator(true);
                }
            }
        }

        function maxInQueue(elevator) {
            var queue = elevator.destinationQueue
            var max = 0
            for(ite=0; ite<queue.length; ite++)
                if(queue[ite] > max)
                    max = queue[ite];
            return max;
        }
        function minInQueue(elevator) {
            var queue = elevator.destinationQueue
            var min = 8
            for(iter=0; iter<queue.length; iter++)
                if(queue[iter] < min)
                    min = queue[iter];
            return min;
        }

    }
}
