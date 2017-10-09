function chart_bar(data){
    
    var chart_ano = dc.barChart("#chart");
    var chart_gen = dc.barChart("#chart_gen");

     data.forEach(function(d){
        var dataYear = new Date().setFullYear(d.Year);
        d.date = dataYear;
    });

    var facts = crossfilter(data);

    console.log(facts.all());

    var anoDim = facts.dimension(function(d){
        return d.Year;
    });

    var genDim = facts.dimension(function(d){
        return d.Genre;
    });
    
    var bilheteriaAno = anoDim.group().reduceSum(function(d){ return d.Worldwide_Gross_M});

    var bilheteriaGen = genDim.group().reduceSum(function(d){ return d.Worldwide_Gross_M});

    chart_ano.width(600)
        .height(400)
        .margins({top: 50, right: 50, bottom: 50, left: 50})
        .dimension(anoDim)
        .xUnits(dc.units.ordinal)
        .x(d3.scale.ordinal())
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(600).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .group(bilheteriaAno, 'Bilheteria');

    chart_gen.width(600)
        .height(400)
        .margins({top: 50, right: 50, bottom: 50, left: 50})
        .dimension(genDim)
        .xUnits(dc.units.ordinal)
        .x(d3.scale.ordinal())
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(600).y(10).itemHeight(13).gap(5))
        .brushOn(false)
        .group(bilheteriaGen);

    dc.renderAll();

}


d3.json("movies.json", function(err, data){
    chart_bar(data)
});
