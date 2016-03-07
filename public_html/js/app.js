/* global Backbone, _, google */

var app = {
    Video: function () {
        var width = Math.max(document.documentElement.clientWidth, window.innerWidth);
        var supportsVideoElement = !!document.createElement('video').canPlayType;

        if (supportsVideoElement && width > 1000) {
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

            var videodiv = '<div id="video_div" class="video_div">\n\
<a href="#info" class="link_content">\n\
<div class="content"><img src="img/banner.png" alt="banner"/>\n\
<img src="img/down.png" alt="down arrow" class="down_arrow"/></div></a></div>';

            $("body").append(videodiv);

            var videoDiv = $('#video_div');

            backVideo.appendChild(source);
            backVideo.load();
            videoDiv.append(backVideo);


            backVideoDom = document.getElementById('back_video');
            backVideoDom.oncanplaythrough = function () {
                backVideoDom.play();
            };
            videoDiv.on('click', '.content', function () {
                $('#back_video').remove();
                $('#video_div').addClass('video_div--hidden');
            });

        } else {
            app.router.navigate('info', {trigger: true});
        }
    }
};

app.mapLoader = function () {

    var url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDGUROHjSwHDzFbfvD07N-47_bq3bdgaOs&libraries=places';
    $.ajax({
        url: url,
        dataType: 'script',
        success: function () {
            app.map.mapSuccess(true);
        }});
};

app.Router = Backbone.Router.extend({
    'routes': {
        '': 'intro',
        'info': 'info',
        'info/video': 'popup',
        'offer': 'offer',
        'map': 'map'
    },
    intro: function () {
        app.video = new app.Video();
    },
    info: function () {
        app.info.render();
        app.popup.clean();
        $('.links').each(function () {
            $(this).removeClass('link-selected');
        });
        $('.infolink').addClass('link-selected');
    },
    popup: function () {

        app.popup.render();
        $('.links').each(function () {
            $(this).removeClass('link-selected');
        });
        $('.infolink').addClass('link-selected');
    },
    offer: function () {
        $('.links').each(function () {
            $(this).removeClass('link-selected');
        });
        $('.offerlink').addClass('link-selected');
    },
    map: function () {
        app.map.render();
        $('.links').each(function () {
            $(this).removeClass('link-selected');
        });
        $('.maplink').addClass('link-selected');

    }
});



app.InfoView = Backbone.View.extend({
    el: $('#app'),
    template: _.template($('#info').html()),
    render: function () {
        this.$el.html(this.template()).hide().fadeIn("slow");
    }

});

app.PopUp = Backbone.View.extend({
    el: $('#popup'),
    template: _.template($('#popup_template').html()),
    render: function () {
        this.$el.html(this.template());
        $('.popup_mask, .popup_container').addClass('popup-enter').fadeTo("slow", 1);
    },
    clean: function () {
        this.$el.html('');
    }

});

app.MapView = Backbone.View.extend({
    el: $('#app'),
    template: _.template($('#map').html()),
    initialize: function () {
        this.status = false;
        this.on("changed:status", this.initMap, this);
    },
    render: function () {
        this.$el.html('');
        this.$el.html(this.template()).fadeIn("slow");
        this.initMap();
    },
    initMap: function () {
        if (this.status && document.getElementById('map_div')) {
            map = new google.maps.Map(document.getElementById('map_div'), {
                center: {lat: 54.51250049999999, lng: 18.539694699999927},
                zoom: 15
            });
            service = new google.maps.places.PlacesService(map);
            var marker = new google.maps.Marker({
                map: map
            });
            var infowindow = new google.maps.InfoWindow();
            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
            marker.setPlace({
                placeId: 'ChIJZQ3glTGn_UYRn6wPMserIKY',
                location: {lat: 54.51250049999999, lng: 18.539694699999927}
            });

            marker.setVisible(true);

            var infoWindowRun = function () {
                if (infowindow) {
                    infowindow.close();
                }
                service.getDetails({
                    placeId: 'ChIJZQ3glTGn_UYRn6wPMserIKY'
                }, function (place, status) {
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

            marker.addListener('click', function () {
                infoWindowRun();
            });

        }
    },
    mapSuccess: function (value) {
        this.status = value;
        this.trigger("changed:status");
    }



});
app.OfferViewItem = Backbone.Model.extend({});

app.OfferViewCollection = Backbone.Collection.extend({});

app.OfferViewItem = Backbone.View.extend({});

app.OfferViewList = Backbone.View.extend({});


$(function () {
    app.mapLoader();
    app.router = new app.Router();
    app.info = new app.InfoView();
    app.map = new app.MapView();
    app.popup = new app.PopUp();
    Backbone.history.start();
});
