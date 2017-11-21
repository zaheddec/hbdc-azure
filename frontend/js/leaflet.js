(function() {
    var map = L.map('mapid').setView([57, -94], 4);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1Ijoib2xpdmllcm5ndXllbiIsImEiOiIyNGExOTIwZTQwNGYyZmJjZWY3Mzk2MTEwY2EwZGRjOCJ9.vhftamcL2cMPjsdCut5SJg'
    }).addTo(map);

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var transfoo;
    var pathypath;
    var co = d3.scaleOrdinal(d3.schemeCategory20b);
    var districts;

    d3.queue()
      .defer(d3.json, "data/gcd_000b11a_e_geo_10_topo.json")
      .await(ready)

    function ready(error, canada) {
        if (error) throw error;
        console.log(canada)

        function style(feat, i){
            var i = feat.indie;
            var coco = co(feat.color = d3.max(districts[i], function(n) {
              return geoschools.features[n].color; }) + 1 | 0);

              return {fillColor: coco,
                      fillOpacity: .8,
                      weight: .8}
         }

        districts = topojson.feature(canada, canada.objects.gcd_000b11a_e_geo)
        geojson = L.geoJson(districts)
                   .addTo(map);

        /*
        // http://jsfiddle.net/cvs5d7o9/2/
        function projectPointD3(x, y) {
            // new L.LatLng creates a new lat/lng object with "lat" and "lng" as
            // keys. Topojson uses the (lng,lat) ordering so the x and y need to be
            // reversed. Equivalent to [y,x], or {lon:x, lat:y}
            var pointLatLng = new L.LatLng(y, x);
            // latLngToLayerPoint takes the lat/lng point and returns the x and y
            // coordinate for the point on the screen.
            var point = map.latLngToLayerPoint(pointLatLng);
            this.stream.point(point.x, point.y);
        }

        // Does plain old projecting from lat/lng to
        // an x/y coordinate
        function projectPoint(lat, lng) {
            var pointLatLng = new L.LatLng(lat, lng);
            var point = map.latLngToLayerPoint(pointLatLng);
            return point
        }

        var transform = d3.geoTransform({point: projectPointD3}),
            path = d3.geoPath().projection(transform);
        transfoo = transform;
        pathypath = path;
        var feature = g.selectAll("path")
            .data(topojson.feature(canada, canada.objects.districts2011).features)
            .enter().append("path");``

        map.on("viewreset", reset);
        reset();

        function reset() {
            var bounds = canada.bbox,
                left = bounds[0],
                bottom = bounds[1],
                right = bounds[2],
                top = bounds[3];
            var topLeft = projectPoint(top, left);
            var bottomRight = projectPoint(bottom, right);
            top = topLeft.y
            left = topLeft.x
            bottom = bottomRight.y
            right = bottomRight.x

            svg.attr("width", right - left)
                .attr("height", bottom - top)
                .style("left", left + "px")
                .style("top", top + "px");
            g.attr("transform", "translate(" + -left + "," + -top + ")");

            feature.attr("d", path);
        }
        */
    }
})();