/* global google, Vue */

Vue.component('start-page', {
    template: '#start_page_template',
    ready: function() {
        $('#video_div').addClass('video_div_background');
        if (this.$parent.displayVideo) {
            this.runVideo();
        } else if (this.$route.path === '/') {
            router.go({
                path: '/info'
            });
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
        }
    }
});

var App = Vue.extend({
    data: function() {
        return {
            folders: {
                "assortment": "img/offer/assortment/",
                "craft": "img/offer/craft/",
                "shop": "img/offer/shop/inside/",
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
    ready: function() {}
});


var Offer = Vue.extend({
    template: '#offer_template',
    ready: function() {
        window.scrollTo(0, 0);
        $('.offerlink').addClass('offer-link-fix');
    },
    beforeDestroy: function() {
        $('.offerlink').removeClass('offer-link-fix');
    },
    data: function() {
        return {
            selected: ''
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

    }
});

var ShopVue = Vue.extend({
    template: '#shop_template',
    ready: function() {
        window.scrollTo(0, 0);

    },
    computed: {
        pics: function() {
            if (this.$parent.offerDataReady.folders) {
                return this.$parent.offerDataReady.folders.shop.inside;
            }
        },
        picFolder: function() {
            return this.$parent.folders.shop + this.$parent.thumbFolder;
        }

    }
});

var CraftVue = Vue.extend({
    template: '#craft_template',
    ready: function() {
        window.scrollTo(0, 0);
        console.log(this.$route.params);
    },
    computed: {
        pics: function() {
            if (this.$parent.offerDataReady.folders) {
                var object = this.$parent.offerDataReady.folders.craft;
                var data = [];
                object.forEach(function(group){
                    group.list.forEach(function(el){
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
        }
    }
});

var AssortVue = Vue.extend({
    template: '#assortment_template',
    ready: function() {
        window.scrollTo(0, 0);
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
                    template: ''
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
            '/shop': {
                component: ShopVue
            },
            '/craft/:filter': {
                component: CraftVue
            },
            '/assortment': {
                component: AssortVue
            }
        }
    },
    '/map': {
        component: Map
    }
});

router.start(App, '#app', function() {});