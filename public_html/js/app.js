/* global Backbone, _ */

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

        }
    }
};

app.Router = Backbone.Router.extend({
    'routes': {
        '': 'intro',
        'info': 'info',
        'offer': 'offer',
        'map': 'map'
    },
    intro: function () {
        app.video = new app.Video();
    },
    info: function () {
        app.info.render();
    },
    offer: function () {
        console.log('ME TOO!');
    },
    map: function () {
        app.map.render();
    }
});



app.InfoView = Backbone.View.extend({
    el: $('#app'),
    template: _.template($('#info').html()),
    render: function () {
        this.$el.html(this.template());
    }

});

app.MapView = Backbone.View.extend({
    el: $('#app'),
    template: _.template($('#map').html()),
    render: function () {
        this.$el.html(this.template());
    }
});

app.OfferViewItem = Backbone.Model.extend({});

app.OfferViewCollection = Backbone.Collection.extend({});

app.OfferViewItem = Backbone.View.extend({});

app.OfferViewList = Backbone.View.extend({});


$(function () {
    app.router = new app.Router();
    app.info = new app.InfoView();
    app.map = new app.MapView();
    Backbone.history.start();
});
