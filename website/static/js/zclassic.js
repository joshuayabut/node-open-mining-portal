  $(document).ready(function() {

		if(!window.statsSource){window.statsSource=new EventSource("/api/live_stats");}
        statsSource.addEventListener('message', function (e) {
            var stats = JSON.parse(e.data);
            for (pool in stats.pools) {
                $('#statsMiners' + algo).text(stats.algos[algo].workers);
                $('span#statsHashrate' + algo).text(stats.algos[algo].hashrateString);
            }
            for (var pool in stats.pools) {
                $('#statsMiners' + pool).text(stats.pools[pool].minerCount + " Miners / " + stats.pools[pool].workerCount + " Workers");
                $('span#statsHashrate' + pool).text(stats.pools[pool].hashrateString);
				
								var confirmed = $("span#confirmedBlocks").text();
				var pending = $("span#pendingBlocks").text();
				
				if(confirmed != stats.pools[pool].blocks.confirmed){
					$("span#confirmedBlocks").text(stats.pools[pool].blocks.confirmed);
				}
								if(pending != stats.pools[pool].blocks.pending){
					$("span#pendingBlocks").text(stats.pools[pool].blocks.pending);
				}
			
            }
        });
    });