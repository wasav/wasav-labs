var Timeline = (function(){	

	function Timeline($container, options){
		var self = this,
			defaultRange = 24 * 3600 * 1000,
			today = new Date().getTime();
		
		this.$container = $container;
		
		// normally defined by css
		this.mainZoneArrowsDistance = 10;
		// normally defined by css
		this.arrowsWidth = 30;
		
		this.defaultOptions = {
			dateFormatter : function(dateUtc){
				return new Date(dateUtc).getHours().toString();
			},
			animationDuration:500,
			startDate: today - 3 * defaultRange,
			endDate : today,
			range: defaultRange,
			wStartDate: today - defaultRange,
			wEndDate: today,
			theme: 'theme-blue',
			windowChanged: $.noop
		};
		
		this.options = {};
		for(var i in this.defaultOptions){
			if(this.defaultOptions.hasOwnProperty(i)){
				this.options[i] = options[i] || this.defaultOptions[i];
			}
		}
		
		if (this.options.wEndDate > this.options.endDate || this.options.wStartDate < this.options.startDate) {
            throw "Specified window dates exceeds time range";
        }
		
		if(this.options.endDate - this.options.startdate < this.options.range){
			throw "Specified window range exceeds time range";
		}
		
		if(!this.$container){
			throw "Invalid container";
		}
		
		this.$container.css({
            "position": "relative"
			})
			.addClass(this.options.theme);
			
		$(window).resize(function(){
			self.resizeHandler();
		}).trigger("resize");
		
	}
	
	/**
     *	Draws the timeline vertical ticks (with their labels)
     *  representing the dates.
     *
     */
    Timeline.prototype.drawTicks = function() {
        var l,    // minimum label width
			width = (this.containerWidth - 2 * (this.arrowsWidth + this.mainZoneArrowsDistance)),
            ticksCount,
            text,
            bbox,
            textStr,
            tick,
            x0 = 0,
			self = this,
            mainZoneHeight = this.$mainZone.height();

		
		textStr = this.options.dateFormatter(this.options.startDate);
		text = $("<span></span>").text(textStr);
		this.$mainZone.append(text);
		l = text.width() + 10;
		ticksCount = Math.floor(width / l);
		text.remove();
		
		var occp = l * ticksCount / width;
		
		while(occp < 0.96){
			// Reajusting spacial occupation
			l += (0.96 - occp) * width / ticksCount;
			ticksCount = Math.floor(width / l);
			occp = l * ticksCount / width;
		}
		
        for (var i = 0; i < ticksCount; i++) {
            // Create tick
            tick = $("<div></div>")
                .addClass("tick")
                .css({
                    "left": x0 + i * l + l / 2 + "px"
                });

            // Create the tick label with the date inside
            var date = new Date(this.convertPositionOffsetIntoDate(x0 + i * l + l / 2));
            textStr = this.tickLabelFormatter(date);

            text = $("<span></span>")
                .addClass("tick-label")
                .css({
                    "left": x0 + i * l + l / 2 + "px",
                    "top": "0px"
                }).text(textStr);

            this.$mainZone.append(tick)
                .append(text);

            text.css({
                "left": text.position().left - text.width() / 2 + "px",
                "top": (mainZoneHeight - text.height()) / 2 + "px"
            });

            // On label click, center the window
            // on the date
            text.on('click', this, this.mainZoneLabelsClickHandler);
            text.on('mousemove', this, this.mainZoneMouseMoveHandler);
            text.on('mouseout', this, this.mainZoneMouseOutHandler);

            this.tickElements.push(tick);
            this.labelElements.push(text);
        }
    };


    /**
     *	Draws the left and right arrows
     *  in charge of translating the window.
     *
     */
    Timeline.prototype.drawArrows = function() {
		var self = this;
        if (!this.$leftArrow) {
            this.$leftArrow = $("<div></div>")
                .addClass("arrow")
                .addClass("left-arrow")
                .css({
                    "left": "0px"
                });

            this.$container.append(this.$leftArrow);

            this.$leftArrow.hover(function() {
                self.$leftArrow.addClass("arrow-hover");
            }, function(){
				self.$leftArrow.removeClass("arrow-hover");
			});

            this.$leftArrow.on("click", function() {
                self.slideLeft();
            });
        }

        if (!this.$rightArrow) {
            this.$rightArrow = $("<div></div>")
                .addClass("arrow")
                .addClass("right-arrow")
                .css({
                    "right": "0px"
                });

            this.$container.append(this.$rightArrow);

            this.$rightArrow.hover(function(){
                self.$rightArrow.addClass("arrow-hover");
            }, function() {
				self.$rightArrow.removeClass("arrow-hover");
			});

            this.$rightArrow.on("click", function() {
                self.slideRight();
            });

            // take the arrow width
            this.arrowsWidth = this.$rightArrow.width() || this.arrowsWidth;
        }


        var diff = this.containerHeight - this.$leftArrow.height();

        if (diff >= 0) {
            this.$leftArrow.css({
                "top": diff/2 + "px"
            });
            this.$rightArrow.css({
                "top": diff / 2 + "px"
            });
        }
    };


    /**
     *	Draws the window on the timeline. If no date is specified,
     *  the window is drawn to have its end date on the period end date.
     *
     *	@param	{number}	[startDate=endDate]	Date to center the window on.
     */
    Timeline.prototype.drawWindow = function(startDate){
        if (!startDate) {
            startDate = this.options.wStartDate;
        }
		
        if (!this.$window) {
			var self = this;
            this.$window = $("<div></div>")
                .addClass("window");
				
			 this.$window.append(
				$("<div></div>").addClass("positioner")
								.addClass("left-positioner")
			).append(
				$("<div></div>").addClass("positioner")
								.addClass("right-positioner")
			);

            this.initalWindowPositionOffset = this.convertDateIntoPositionOffset(this.options.wStartDate);

            this.$window.css({
                "left": this.initalWindowPositionOffset + "px",
                "width": this.convertRangeDateIntoPixel(this.options.range) + "px"
            });

            this.$mainZone.append(this.$window);
            
            this.$window.draggable({
                zIndex: 1000,
                containment: "parent",
                helper: function() {
                    return $("<div></div>")
                        .addClass("window")
                        .addClass("dragging-clone")
                        .css({
                            "left": self.$window.css("left") + "px",
                            "width": self.$window.width() + "px"
                        }).append(
                            $("<div></div>").addClass("positioner")
                                .addClass("left-positioner")
                        ).append(
                            $("<div></div>").addClass("positioner")
                                .addClass("right-positioner")
                        );
                },
                start: function(evt, ui){
                    self.$window.addClass('dragging');
                },
                stop: function(evt, ui){
                    self.$window.removeClass('dragging');
                    if (ui && ui.position) {
                        var pos = ui.position.left,
                            date = self.convertPositionOffsetIntoDate(pos);

                        self.drawWindow(date);
                        self.options.wEndDate = date + self.options.range;
                        self.options.wStartDate = date;
						self.windowChanged();
                    }
                }
            });
        }

        var destination = this.convertDateIntoPositionOffset(startDate);

        if (Modernizr.csstransitions && Modernizr.csstransforms3d) {
            this.$window.css({
                "transition-duration": this.options.animationDuration + "ms",
                "transform": "translate3d(" + (destination - this.initalWindowPositionOffset) + "px,0,0) scale3d(1,1,1)"
            });
        }
        else if (Modernizr.csstransitions && Modernizr.csstransforms) {
            this.$window.css({
                "transition-duration": this.options.animationDuration + "ms",
                "transform": "translate(" + (destination - this.initalWindowPositionOffset) + "px,0)"
            });
        }
        else {
            this.$window.animate({
                left: destination + "px"
            });
        }

    };


    /**
     *	Draws the timeline main "box"
     *
     */
    Timeline.prototype.drawMainZone = function(){
        var self = this,
			clickHandler = function(evt){
            if (evt.target === self.$mainZone[0]) {
                // if the user clicks on the window, do not
                // react
                var pos = self.getOffsetX(evt);
                self.slideTo(pos);
            }
        }, mousemoveHandler = function(evt){

                if (!self.$window.hasClass('dragging') && evt.target === self.$mainZone[0]) {
                    // Display tooltip only if not dragging
                    // and not over the window
                    var off = self.getOffsetX(evt),
                        pos = self.arrowsWidth + self.mainZoneArrowsDistance + off;

                    // show it first in case it is not created
                    self.showTooltipWindow(pos + 15, pos);

                    if (pos + 15 + self.$tooltipWindow.width() >= self.containerWidth) {
                        self.showTooltipWindow(pos - 15 - self.$tooltipWindow.width(), pos);
                    }
                }
            }, mouseoutHandler = function(evt){

                if (!self.$window.hasClass('dragging') && evt.target === self.$mainZone[0]) {
                    if (self.$tooltipWindow) {
                        self.$tooltipWindow.hide();
                    }
                }

            };

        if (!this.$mainZone) {
            this.$mainZone = $("<div></div>")
                .addClass("main-zone");

            this.$container.append(this.$mainZone);
			
			this.mainZoneArrowsDistance = this.$mainZone.position().left - this.arrowsWidth;

            this.$mainZone.on("click", clickHandler);
            this.$mainZone.on("mousemove", mousemoveHandler);
            this.$mainZone.on("mouseout", mouseoutHandler);

        }

    };


    /**
     *	Destroys the drawn ticks elements.
     *
     *	@memberof	module:D64.TimelineContext#
     *	@method	destroyTicks
     */
    Timeline.prototype.destroyTicks = function() {
		var self = this;
		if(this.tickElements && this.tickElements.length>0){
			$.each(this.tickElements, function(index, tick){
				tick.remove();
				self.labelElements[index].remove();
			});
		}
        
        this.tickElements = [];
        this.labelElements = [];
    };

    Timeline.prototype.destroy = function(){
        this.subscription.dispose();
    };
    
    /**
     *	Redraws the timeline after a certain time.
     *
     *	@memberof	module:D64.TimelineContext#
     *	@method	resizeHandler
     */
    Timeline.prototype.resizeHandler = function() {
      var self = this;
	  if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
        }

        this.resizeTimeout = setTimeout(function(){
            self.resize();
            self.resizeTimeout = null;
        }, 200);
    };


    Timeline.prototype.resize = function() {
		this.destroyTicks();

        this.containerHeight = this.$container.height();
        this.containerWidth = this.$container.width();

        if (isNaN(this.containerWidth) || this.containerWidth === 0) {
            this.containerWidth = 100;
        }

        if (isNaN(this.containerHeight) || this.containerHeight === 0) {
            this.containerHeight = 50;
        }

        if (this.$window) {
            this.$window.remove();
            this.$window = null;
        }

        this.drawArrows();
        this.drawMainZone();
        this.drawWindow();
        this.drawTicks();
		
    };

    /**
     *	Draws the window on the specified position (pixel)
     *
     *	@param	{number}	x	Position to draw the window on
     */
    Timeline.prototype.slideTo = function(x){
        var clickedDate = this.convertPositionOffsetIntoDate(x),
            target = clickedDate - this.options.range / 2;

        // check for boundaries
        if (target < this.options.startDate) {
            target = this.options.startDate;
        } else if (target + this.options.range > this.options.endDate) {
            target = this.options.endDate - this.options.range;
        }

        this.drawWindow(target);
        this.options.wEndDate = target + this.options.range;
        this.options.wStartDate = target;
		
		this.windowChanged();
    };

    /**
     *	Translate the window of one range to the left
     *
     */
    Timeline.prototype.slideLeft = function() {

		if (this.options.wStartDate !== this.options.startDate) {
			if (this.options.wStartDate - this.options.range >= this.options.startDate) {

				this.drawWindow(this.options.wStartDate - this.options.range);

				this.options.wStartDate = this.options.wStartDate - this.options.range;
				this.options.wEndDate = this.options.wStartDate + this.options.range;
			} else if (this.options.wStartDate > this.options.startDate) {

				this.drawWindow(this.options.startDate);

				this.options.wStartDate = this.options.startDate;
				this.options.wEndDate = this.options.wStartDate + this.options.range;

			}
			this.windowChanged();
		}
    };

    /**
     *	Moves the window from one range to the right
     *
     */
    Timeline.prototype.slideRight = function() {

		if(this.options.wEndDate !== this.options.endDate){
			if (this.options.wEndDate + this.options.range <= this.options.endDate) {

				this.drawWindow(this.options.wStartDate + this.options.range);

				this.options.wStartDate = this.options.wStartDate + this.options.range;
				this.options.wEndDate = this.options.wEndDate + this.options.range;

			} else if(this.options.wEndDate < this.options.endDate) {
				var range = this.options.endDate - this.options.wEndDate;

				this.drawWindow(this.options.endDate - this.options.range);
				this.options.wEndDate = this.options.endDate;
				this.options.wStartDate = this.options.endDate - this.options.range;

			}
			
			this.windowChanged();
		}
        
    };

    /**
     *	Displays a tooltip with the date pointed by the cursor.
     *
     *	@param	{number}	xPosition	Position where to display the tooltip
     *	@param	{number}	dateInPixelToShow	Position of the cursor in pixel, used
     *                                          for date conversion
     */
    Timeline.prototype.showTooltipWindow = function(xPosition, dateInPixelToShow){
        var date = new Date(this.convertPositionOffsetIntoDate(dateInPixelToShow)),
            dateStr = this.tickLabelFormatter(date);

        if (!this.$tooltipWindow) {
            this.$tooltipWindow = $("<div></div>").addClass("tooltip-window");
            this.$container.append(this.$tooltipWindow);
            this.$tooltipWindow.append($("<span></span>"));
			
			this.$tooltipWindow.hide();
        }
        
		if(this.tickElements && this.tickElements.length < 4){
			return;
		}
		
		$("span", this.$tooltipWindow).text(dateStr);
		this.$tooltipWindow.show();

        this.$tooltipWindow.css({
            "left": xPosition + "px"
        });
    };


    /**
     *	Given a x position on the timeline, returns the
     *  represented date.
     *
     *	@param	{number}	pixel	x position as if it were a x-axis
     *	@returns	{number}	The represented date
     */
    Timeline.prototype.convertPositionOffsetIntoDate = function(pixel) {

        var arrowArea = this.arrowsWidth + this.mainZoneArrowsDistance;

        return pixel * (this.options.endDate - this.options.startDate) / (this.containerWidth - 2*arrowArea) + this.options.startDate;

    };


    /**
     *	Given a date, returns the pixel position on the timeline.
     *
     *	@param	{number}	date	Date in milliseconds
     *	@returns	{number}	Position as if it was a x-axis
     */
    Timeline.prototype.convertDateIntoPositionOffset = function(date) {
        var arrowArea = this.arrowsWidth + this.mainZoneArrowsDistance;

        return (date - this.options.startDate) * (this.containerWidth - 2 * arrowArea) / (this.options.endDate - this.options.startDate);
    };


    /**
     *	Given a range in milliseconds, returns the length
     *  covered in pixel.
     *
     *	@param	{number}	rangeDate	Date range
     *	@returns	{number}	pixels covered
     */
    Timeline.prototype.convertRangeDateIntoPixel = function(rangeDate) {
        return rangeDate * (this.containerWidth - 2*(this.arrowsWidth + this.mainZoneArrowsDistance)) / (this.options.endDate - this.options.startDate);
    };

	/**
     *	Returns the offset X from the event.
     *  If not defined, as in Firefox, calculates it from pageX.
     *
     *	@param	{any}	evt	JQuery Event
     *	@returns	{number}	Offset X
     */
    Timeline.prototype.getOffsetX = function(evt) {
        var result = null,
            $target = $(evt.target);

        if (evt.offsetX === undefined) {
            // firefox case
            result = evt.pageX - $target.offset().left;
        } else {
            result = evt.offsetX;
        }

        return result;
    };
	
	Timeline.prototype.tickLabelFormatter = function(dateUtc){
		return this.options.dateFormatter(dateUtc);
	};
	
	/**			Handlers Part			**/
	
	Timeline.prototype.mainZoneLabelsClickHandler = function(evt){
		var $label = $(evt.currentTarget);
		var offset = $label.position();
		evt.data.slideTo(offset.left + $label.width() / 2);
	};
	
	Timeline.prototype.mainZoneMouseMoveHandler = function(evt){
		if (!evt.data.$window.hasClass('dragging')) {
			var $label = $(evt.currentTarget),
				position = $label.position(),
				parentPos = evt.data.$mainZone.position(),
				pos = parentPos.left + position.left + evt.data.getOffsetX(evt) + 15;

			// Show it first in case it is not created
			evt.data.showTooltipWindow(pos, position.left + $label.width() / 2);

			if (pos + evt.data.$tooltipWindow.width() >= evt.data.containerWidth - 2 * (evt.data.mainZoneArrowsDistance + evt.data.arrowsWidth)) {
				pos = pos - 30 - evt.data.$tooltipWindow.width();
				evt.data.showTooltipWindow(pos, position.left + $label.width() / 2);
			}

		}
	};
	
	Timeline.prototype.mainZoneMouseOutHandler = function(evt){
		if (!evt.data.$window.hasClass('dragging') && evt.data.$tooltipWindow) {
			evt.data.$tooltipWindow.hide();
		}
	};
	
	
	/**			Dispatcher Part			**/
	
	Timeline.prototype.windowChanged = function(){
		this.options.windowChanged({
			windowStartDate: Math.round(this.options.wStartDate),
			windowEndDate : Math.round(this.options.wEndDate)
		});
	};
	
	
	return Timeline;
})();
