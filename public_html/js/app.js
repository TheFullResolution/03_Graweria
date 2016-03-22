/* global google, Vue */

Vue.component('start-page', {
    template: '#start_page_template',
    ready: function() {
        $('#video_div').addClass('video_div_background');
        if (this.$parent.displayVideo) {
            this.runVideo();
        }
        this.scrollVideodown();
    },
    methods: {
        runVideo: function() {
            var supportsVideoElement = !!document.createElement('video').canPlayType;
            if (supportsVideoElement) {
                var backVideo = document.createElement("video");
                backVideo.className = "video";
                backVideo.id = "back_video";
                backVideo.loop = true;
                backVideo.poster = "img/sequence01.jpg";
                var canPlay_MP4 = backVideo.canPlayType('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
                var canPlay_OGV = backVideo.canPlayType('video/ogg; codecs="theora,vorbis"');
                var canPlay_WEMB = backVideo.canPlayType('video/webm; codecs="vp8,vorbis"');
                var source = document.createElement("source");
                if (canPlay_MP4.length > 0) {
                    source.type = "video/mp4";
                    source.src = "video/grawer_background.mp4";
                } else if (canPlay_OGV.length > 0) {
                    source.type = "video/ogg";
                    source.src = "video/grawer_background.ogv";
                } else if (canPlay_WEMB.length > 0) {
                    source.type = "video/webm";
                    source.src = "video/grawer_background.webm";
                }
                var videoDiv = $('#video_div');
                backVideo.appendChild(source);
                backVideo.load();
                videoDiv.append(backVideo);
                backVideoDom = document.getElementById('back_video');
                backVideoDom.oncanplaythrough = function() {
                    backVideoDom.play();
                };
            }
        },
        scrollVideodown: function() {
            var self = this;
            $('#video_div').bind('mousewheel', function() {
                self.putVideodown();
                router.go({
                    path: '/info'
                });
            });
        },
        putVideodown: function() {
            $('#back_video').remove();
            $('#video_div').off('mousewheel');
        }
    }
});

var App = Vue.extend({
    data: function() {
        return {
            folders: {
                "assortment": "img/offer/assortment/",
                "craft": "img/offer/craft/",
                "shop": "img/offer/shop/",
            },
            mapSuccess: false,
            selected: '',
            offerdata: {}
        };
    },
    ready: function() {
        this.downloadMapAPI();
        this.downloadlazyload();
        this.fetchData();
        this.checklink();
    },
    computed: {
        displayVideo: function() {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth);
            if (this.$route.path === '/') {
                if (width < 800 && (typeof window.orientation) !== 'undefined') {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },
        langText: function() {
            return 'english';
        },
        thumbFolder: function() {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth);
            if (width < 800) {
                return "small/";
            } else {
                return "mid/";
            }

        },
        offerDataReady: function() {
            return this.offerdata;
        }
    },
    methods: {
        checklink: function() {
            if (this.$route.path === '/' && !this.displayVideo) {
                router.go({
                    path: '/info'
                });
            }
        },
        downloadMapAPI: function() {
            var self = this;
            var url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDGUROHjSwHDzFbfvD07N-47_bq3bdgaOs&libraries=places';
            $.ajax({
                url: url,
                dataType: 'script',
                success: function() {
                    self.mapSuccess = true;
                }
            });
        },
        downloadlazyload: function() {
            var url = "js/lazysizes.min.js";
            $.ajax({
                url: url,
                dataType: 'script',
                success: function() {
                    window.lazySizesConfig = {
                        addClasses: true
                    };

                }
            });
        },
        fetchData: function() {
            var self = this;
            $.getJSON("js/offer.json", function(json) {
                self.offerdata = json;
            });
        }
    }
});


var Info = Vue.extend({
    template: '#info_template',
    ready: function() {
        window.scrollTo(0, 0);
    }
});

var VideoPopup = Vue.extend({
    template: '#videopopup_template',
    ready: function() {
        $('body').css('overflow-y', 'hidden');
        $('body').addClass('disable-scrolling');
    }
});


var Offer = Vue.extend({
    template: '#offer_template',
    ready: function() {
        window.scrollTo(0, 0);
        $('.offerlink').addClass('offer-link-fix');
        this.stickyHeader(jQuery, window, document);
        this.forceFilters();
    },
    beforeDestroy: function() {
        $('.offerlink').removeClass('offer-link-fix');
        $(window).off('scroll');
        $(window).off('resize');
    },
    data: function() {
        return {
            selected: '',
            show: true
        };
    },
    computed: {
        offerDataReady: function() {
            return this.$parent.offerDataReady;
        },
        folders: function() {
            return this.$parent.folders;
        },
        thumbFolder: function() {
            return this.$parent.thumbFolder;
        }
    },
    methods: {
        filterClick: function() {
            window.scrollTo(0, 0);
        },
        upClick: function() {
            window.scrollTo(0, 0);
        },
        forceFilters: function() {
            var self = this;
            $(window).resize(function() {
                windowCheck = $(window).width();
                if (windowCheck > 650) {
                    self.show = true;
                }
            });
        },
        toggleFilter: function() {
            this.show = !this.show;
        },
        stickyHeader: function($, window, document, undefined) {
            'use strict';

            var elSelector = '.link_offer_sticky',
                elClassShow = 'link_offer_show',
                $element2 = $('.link_offer_div'),
                el2ClassHide = 'link_offer_hide',
                throttleTimeout = 300,
                $element = $(elSelector);

            if (!$element.length) return true;

            var $window = $(window),
                wScrollCurrent = 0,
                wScrollBefore = 0,
                wScrollDiff = 0,
                $document = $(document),
                throttle = function(delay, fn) {
                    var last, deferTimer;
                    return function() {
                        var context = this,
                            args = arguments,
                            now = +new Date();
                        if (last && now < last + delay) {
                            clearTimeout(deferTimer);
                            deferTimer = setTimeout(function() {
                                last = now;
                                fn.apply(context, args);
                            }, delay);
                        } else {
                            last = now;
                            fn.apply(context, args);
                        }
                    };
                };

            $window.on('scroll', throttle(throttleTimeout, function() {
                wScrollCurrent = $window.scrollTop();
                wScrollDiff = wScrollBefore - wScrollCurrent;
                if (wScrollCurrent <= 300) {
                    $element.removeClass(elClassShow);
                    $element2.removeClass(el2ClassHide);

                } else if (wScrollDiff < 0) // scrolled down
                {

                    $element.addClass(elClassShow);
                    $element2.addClass(el2ClassHide);
                }
            }));

        }
    }
});

var ShopVue = Vue.extend({
    template: '#shop_template',
    ready: function() {
        window.scrollTo(0, 0);
        $('.shop_link').addClass('link_offer-active');
    },
    beforeDestroy: function() {
        $('.shop_link').removeClass('link_offer-active');
    },
    computed: {
        pics: function() {
            if (this.$parent.offerDataReady.folders) {
                var object = this.$parent.offerDataReady.folders.shop;
                var data = [];
                object.forEach(function(group) {
                    group.list.forEach(function(el) {
                        data.push(el);
                    });
                });
                return data;
            }
        },
        groupFolder: function() {
            return this.$parent.folders.shop;
        },
        thumbFolder: function() {
            return this.$parent.thumbFolder;
        },
        zoomlink: function() {
            return '/offer/shop/all/';
        },


    }
});

var CraftVue = Vue.extend({
    template: '#craft_template',
    ready: function() {
        window.scrollTo(0, 0);
        $('.craft_link').addClass('link_offer-active');
        this.stickyfilters(jQuery, window, document);
        this.$parent.show = true;
    },
    beforeDestroy: function() {
        $('.craft_link').removeClass('link_offer-active');
    },
    computed: {
        pics: function() {
            if (this.$parent.offerDataReady.folders) {
                var object = this.$parent.offerDataReady.folders.craft;
                var data = [];
                object.forEach(function(group) {
                    group.list.forEach(function(el) {
                        data.push(el);
                    });
                });
                return data;
            }
        },
        groupFolder: function() {
            return this.$parent.folders.craft;
        },
        thumbFolder: function() {
            return this.$parent.thumbFolder;
        },
        filterVal: function() {
            if (this.$route.params.filter === 'all') {
                return '';
            } else {
                return this.$route.params.filter;
            }
        },
        zoomlink: function() {
            return '/offer/craft/' + this.$route.params.filter + '/';
        }
    },
    methods: {
        stickyfilters: function($, window, document, undefined) {
            'use strict';

            var throttleTimeout = 300,
                $elFilters = $('.offer_filters_div'),
                elFiltersClass = 'offer_filters_scroll';

            if (!$elFilters.length) return true;

            var $window = $(window),
                wScrollCurrent = 0,
                $document = $(document),

                throttle = function(delay, fn) {
                    var last, deferTimer;
                    return function() {
                        var context = this,
                            args = arguments,
                            now = +new Date();
                        if (last && now < last + delay) {
                            clearTimeout(deferTimer);
                            deferTimer = setTimeout(function() {
                                last = now;
                                fn.apply(context, args);
                            }, delay);
                        } else {
                            last = now;
                            fn.apply(context, args);
                        }
                    };
                };

            $window.on('scroll', throttle(throttleTimeout, function() {
                wScrollCurrent = $window.scrollTop();

                if (wScrollCurrent >= 300) {
                    $elFilters.addClass(elFiltersClass);
                } else {
                    $elFilters.removeClass(elFiltersClass);
                }
            }));

        }

    }
});

var AssortVue = Vue.extend({
    template: '#assortment_template',
    ready: function() {
        window.scrollTo(0, 0);
        $('.assortment_link').addClass('link_offer-active');
        this.stickyfilters(jQuery, window, document);
    },
    beforeDestroy: function() {
        $('.assortment_link').removeClass('link_offer-active');
    },
    computed: {
        pics: function() {
            if (this.$parent.offerDataReady.folders) {
                var object = this.$parent.offerDataReady.folders.assortment;
                var data = [];
                object.forEach(function(group) {
                    group.list.forEach(function(el) {
                        data.push(el);
                    });
                });
                return data;
            }
        },
        groupFolder: function() {
            return this.$parent.folders.assortment;
        },
        thumbFolder: function() {
            return this.$parent.thumbFolder;
        },
        filterVal: function() {
            if (this.$route.params.filter === 'all') {
                return '';
            } else {
                return this.$route.params.filter;
            }
        },
        zoomlink: function() {
            return '/offer/assortment/' + this.$route.params.filter + '/';
        }
    },
    methods: {
        stickyfilters: function($, window, document, undefined) {
            'use strict';

            var throttleTimeout = 300,
                $elFilters = $('.offer_filters_div'),
                elFiltersClass = 'offer_filters_scroll';

            if (!$elFilters.length) return true;

            var $window = $(window),
                wScrollCurrent = 0,
                $document = $(document),

                throttle = function(delay, fn) {
                    var last, deferTimer;
                    return function() {
                        var context = this,
                            args = arguments,
                            now = +new Date();
                        if (last && now < last + delay) {
                            clearTimeout(deferTimer);
                            deferTimer = setTimeout(function() {
                                last = now;
                                fn.apply(context, args);
                            }, delay);
                        } else {
                            last = now;
                            fn.apply(context, args);
                        }
                    };
                };

            $window.on('scroll', throttle(throttleTimeout, function() {
                wScrollCurrent = $window.scrollTop();

                if (wScrollCurrent >= 300) {
                    $elFilters.addClass(elFiltersClass);
                } else {
                    $elFilters.removeClass(elFiltersClass);
                }
            }));

        }
    }
});


var ZoomVue = Vue.extend({
    template: '#picture_zoom_template',
    ready: function() {
        $('body').css('overflow-y', 'hidden');
        $('body').addClass('disable-scrolling');
        this.swipe();
        this.$watch(function() {
                return this.index;
            },
            function() {
                this.imgChange();
            });
    },
    computed: {
        zoomPics: function() {
            if (this.$parent.pics) {
                filter = this.$route.params.filter;
                data = this.$parent.pics;
                filteredData = [];

                if (filter === 'all') {
                    return data;
                } else {
                    data.forEach(function(el) {
                        if (el.product === filter) {
                            filteredData.push(el);
                        }
                    });
                    return filteredData;
                }
            } else {
                return [];
            }
        },
        lengthZoomPics: function() {
            if (this.$parent.pics) {
                filter = this.$route.params.filter;
                data = this.$parent.pics;
                filteredData = [];

                if (filter === 'all') {
                    return data.length;
                } else {
                    data.forEach(function(el) {
                        if (el.product === filter) {
                            filteredData.push(el);
                        }
                    });
                    return filteredData.length;
                }
            } else {
                return 0;
            }
        },
        groupFolder: function() {
            return this.$parent.groupFolder;
        },
        thumbFolder: function() {
            return 'zoom/';
        },
        index: function() {
            if (this.$route.params.picId) {
                return parseInt(this.$route.params.picId);
            } else {
                return 0;
            }
        },
        currentPic: function() {
            if (this.zoomPics) {
                var pic = this.zoomPics[this.index];
                return pic;
            } else {
                return '';
            }
        },
        nextpic: function() {
            var check = this.lengthZoomPics;
            if ((this.index + 1) === check) {
                return 0;
            } else {
                return this.index + 1;
            }
        },
        prevpic: function() {
            var check = this.lengthZoomPics;
            if (this.index === 0) {
                return check - 1;
            } else {
                return this.index - 1;
            }
        },
        zoomlink: function() {
            return this.$parent.zoomlink;
        },
        imgClass: function() {
            if (this.currentPic.portrait) {
                return 'img_link_port';
            } else {
                return '';
            }
        },
        popClass: function() {
            if (this.currentPic.portrait) {
                return 'popup_container_h';
            } else {
                return '';
            }
        }
    },
    methods: {
        imgChange: function() {
            $(".img_link_img").attr("src", "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
            $('.img_link_img').removeClass('lazyloaded').addClass('lazyload');
        },
        details: function() {
            $('.popup_details').slideToggle("fast");
            $('.popup_details_top').slideToggle("fast");

        },
        swipe: function() {
            var self = this;
            var options = {
                preventDefault: true
            };
            var myElement = document.getElementById('swipe_div');
            var mc = new Hammer(myElement, options);
            mc.on('swipeleft', function() {
                var path = {
                    path: self.zoomlink + self.nextpic
                };
                router.go(path);
                self.imgChange();
            });
            mc.on('swiperight', function() {
                var path = {
                    path: self.zoomlink + self.prevpic
                };
                router.go(path);
                self.imgChange();
            });

        }
    }

});


var Map = Vue.extend({
    template: '#map_template',
    ready: function() {
        window.scrollTo(0, 0);
        this.loadMap();
        this.$watch(function() {
            return this.status;
        }, function() {
            this.loadMap();
        });
    },
    computed: {
        status: function() {
            return this.$parent.mapSuccess;
        }
    },
    methods: {
        loadMap: function() {
            var placeID = 'ChIJZQ3glTGn_UYRn6wPMserIKY';
            var mapDiv = document.getElementById('map_div');
            if (mapDiv && this.status) {
                map = new google.maps.Map(mapDiv, {
                    center: {
                        lat: 54.51250049999999,
                        lng: 18.539694699999927
                    },
                    zoom: 15
                });
                service = new google.maps.places.PlacesService(map);
                var marker = new google.maps.Marker({
                    map: map
                });
                var infowindow = new google.maps.InfoWindow();
                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });
                marker.setPlace({
                    placeId: placeID,
                    location: {
                        lat: 54.51250049999999,
                        lng: 18.539694699999927
                    }
                });

                marker.setVisible(true);

                var infoWindowRun = function() {
                    if (infowindow) {
                        infowindow.close();
                    }
                    service.getDetails({
                        placeId: placeID
                    }, function(place, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            var text = '<h3>' +
                                place.name + '</h3>' +
                                '<p>' + place.formatted_address + '</p>';
                            infowindow = new google.maps.InfoWindow({
                                content: text,
                                maxWidth: 220
                            });
                            infowindow.open(map, marker);
                        }
                    });

                };

                marker.addListener('click', function() {
                    infoWindowRun();
                });

            }
        }
    }
});


var router = new VueRouter({});

router.map({
    '/info': {
        component: Info,
        subRoutes: {
            '/': {
                component: {
                    template: '',
                    ready: function() {
                        $('body').css('overflow-y', 'auto');
                        $('body').removeClass('disable-scrolling');
                    }

                }
            },
            '/video': {
                component: VideoPopup
            }
        }
    },
    '/offer': {
        component: Offer,
        subRoutes: {
            '/shop/:filter': {
                component: ShopVue,
                subRoutes: {
                    '/': {
                        component: {
                            template: '',
                            ready: function() {
                                $('body').css('overflow-y', 'auto');
                                $('body').removeClass('disable-scrolling');
                            }
                        }
                    },
                    '/:picId': {
                        component: ZoomVue
                    }
                }
            },
            '/craft/:filter': {
                component: CraftVue,
                subRoutes: {
                    '/': {
                        component: {
                            template: '',
                            ready: function() {
                                $('body').css('overflow-y', 'auto');
                                $('body').removeClass('disable-scrolling');
                            }
                        }
                    },
                    '/:picId': {
                        component: ZoomVue
                    }
                }
            },
            '/assortment/:filter': {
                component: AssortVue,
                subRoutes: {
                    '/': {
                        component: {
                            template: '',
                            ready: function() {
                                $('body').css('overflow-y', 'auto');
                                $('body').removeClass('disable-scrolling');
                            }
                        }
                    },
                    '/:picId': {
                        component: ZoomVue
                    }
                }
            }
        }
    },
    '/map': {
        component: Map
    }
});

router.start(App, '#app', function() {});

document.ontouchmove = function(event) {
    var isTouchMoveAllowed = true,
        target = event.target;
    while (target !== null) {
        if (target.classList && target.classList.contains('disable-scrolling')) {
            isTouchMoveAllowed = false;
            break;
        }
        target = target.parentNode;
    }

    if (!isTouchMoveAllowed) {
        event.preventDefault();
    }
};