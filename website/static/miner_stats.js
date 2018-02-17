var workerHashrateData;
var workerHashrateChart;
var workerHistoryMax = 160;
var statData;
var poolData;
var totalHash;
var totalImmature;
var totalBal;
var totalPaid;
var totalShares;

var statpool;
var statluckpool;
var network;
var sharecountpool;

$.getJSON('/api/stats', function(statsSourcePOOL) {
  var stattts = statsSourcePOOL;
  statpool = (((stattts.algos.equihash.hashrate) / 1000) / 1000) * 2;
  network = stattts.pools.bitcoinz.poolStats.networkSols;
  statluckpool = (network / statpool * 152) / (24 * 60 * 60);
  sharecountpool = stattts.pools.bitcoinz.shareCount;
  netdiff = stattts.pools.bitcoinz.poolStats.networkDiff;
});

$("#addtodash").click( function(e) {
  localStorage.vmAddress = statData.miner;
  alert("Dashboard Address Set. Redirecting to dashboard...");
  window.location.href = "/dashboard";
});

function getReadableHashRateString(hashrate) {
  hashrate = (hashrate * 2);
  if (hashrate < 1000000) {
    return (Math.round(hashrate / 1000) / 1000).toFixed(2) + ' Sol/s';
  }
  var byteUnits = [' Sol/s', ' KSol/s', ' MSol/s', ' GSol/s', ' TSol/s', ' PSol/s'];
  var i = Math.floor((Math.log(hashrate / 1000) / Math.log(1000)) - 1);
  hashrate = (hashrate / 1000) / Math.pow(1000, i + 1);
  return hashrate.toFixed(2) + byteUnits[i];
}
function timeOfDayFormat(timestamp) {
  var dStr = d3.time.format('%I:%M %p')(new Date(timestamp));
  if (dStr.indexOf('0') === 0)
  dStr = dStr.slice(1);
  return dStr;
}
function getWorkerNameFromAddress(w) {
  var worker = w;
  if (w.split(".").length > 1) {
    worker = w.split(".")[1];
    if (worker == null || worker.length < 1) {
      worker = "noname";
    }
  } else {
    worker = "noname";
  }
  return worker;
}
function buildChartData() {
  var workers = {};
  for (var w in statData.history) {
    var worker = getWorkerNameFromAddress(w);
    var a = workers[worker] = (workers[worker] || {
      hashrate: []
    });
    for (var wh in statData.history[w]) {
      a.hashrate.push([statData.history[w][wh].time * 1000, statData.history[w][wh].hashrate]);
    }
    if (a.hashrate.length > workerHistoryMax) {
      workerHistoryMax = a.hashrate.length;
    }
  }
  var i = 0;
  workerHashrateData = [];
  for (var worker in workers) {
    workerHashrateData.push({
      key: worker,
      disabled: (i > Math.min((_workerCount - 1), 3)),
      values: workers[worker].hashrate
    });
    i++;
  }
}
function updateChartData() {
  var workers = {};
  for (var w in statData.history) {
    var worker = getWorkerNameFromAddress(w);
    for (var wh in statData.history[w]) {}
    var foundWorker = false;
    for (var i = 0; i < workerHashrateData.length; i++) {
      if (workerHashrateData[i].key === worker) {
        foundWorker = true;
        if (workerHashrateData[i].values.length >= workerHistoryMax) {
          workerHashrateData[i].values.shift();
        }
        workerHashrateData[i].values.push([statData.history[w][wh].time * 1000, statData.history[w][wh].hashrate]);
        break;
      }
    }
    if (!foundWorker) {
      var hashrate = [];
      hashrate.push([statData.history[w][wh].time * 1000, statData.history[w][wh].hashrate]);
      workerHashrateData.push({
        key: worker,
        values: hashrate
      });
      rebuildWorkerDisplay();
      return true;
    }
  }
  triggerChartUpdates();
  return false;
}
function calculateAverageHashrate(worker) {
  var count = 0;
  var total = 1;
  var avg = 0;
  for (var i = 0; i < workerHashrateData.length; i++) {
    count = 0;
    for (var ii = 0; ii < workerHashrateData[i].values.length; ii++) {
      if (worker == null || workerHashrateData[i].key === worker) {
        count++;
        avg += parseFloat(workerHashrateData[i].values[ii][1]);
      }
    }
    if (count > total)
    total = count;
  }
  avg = avg / total;
  return avg;
}
function triggerChartUpdates() {
  workerHashrateChart.update();
}
function displayCharts() {
  nv.addGraph(function() {
    for (var i in workerHashrateData) {
      workerHashrateData[i].disabled = false;
    }
    workerHashrateChart = nv.models.lineChart().margin({
      left: 80,
      right: 15
    }).x(function(d) {
      return d[0]
    }).y(function(d) {
      return d[1]
    }).useInteractiveGuideline(true).clipEdge(true);
    workerHashrateChart.xAxis.showMaxMin(false).tickFormat(timeOfDayFormat);
    workerHashrateChart.yAxis.tickFormat(function(d) {
      return getReadableHashRateString(d);
    });
    d3.select('#workerHashrate').datum(workerHashrateData).transition().duration(500).call(workerHashrateChart);
    return workerHashrateChart;
  });
}
function updateStats() {
  totalHash = statData.totalHash;
  totalPaid = statData.paid;
  totalBal = statData.balance;
  totalImmature = statData.immature;
  var _blocktime = 250;
  var _networkHashRate = parseFloat(statData.networkSols) * 1.2;
  var _myHashRate = (totalHash / 1000000) * 2;
  var luckDays = ((_networkHashRate / _myHashRate * _blocktime) / (24 * 60 * 60)).toFixed(3);
  $("#statsHashrate").text(getReadableHashRateString(totalHash));
  $("#statsHashrateAvg").text(getReadableHashRateString(calculateAverageHashrate(null)));
  $("#statsLuckDays").text(luckDays);
  $("#statsTotalImmature").text(totalImmature);
  $("#statsTotalBal").text(totalBal);
  $("#statsTotalPaid").text(totalPaid);
  var totalShares = statData.totalShares;
  var estimatedCoins = 0;
  totalShares = totalShares.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  $("#statsTotalShares").text(totalShares);

}

function updateWorkerStats() {
  var i = 0;
  for (var w in statData.workers) {
    i++;
    var htmlSafeWorkerName = w.split('.').join('_').replace(/[^\w\s]/gi, '');
    var saneWorkerName = getWorkerNameFromAddress(w);
    $("#statsHashrate" + htmlSafeWorkerName).text(getReadableHashRateString(statData.workers[w].hashrate));
    $("#statsHashrateAvg" + htmlSafeWorkerName).text(getReadableHashRateString(calculateAverageHashrate(saneWorkerName)));
    $("#statsLuckDays" + htmlSafeWorkerName).text(statData.workers[w].luckDays);
    $("#statsPaid" + htmlSafeWorkerName).text(statData.workers[w].paid);
    $("#statsBalance" + htmlSafeWorkerName).text(statData.workers[w].balance);
    $("#statsShares" + htmlSafeWorkerName).text(Math.round(statData.workers[w].currRoundShares * 100) / 100);
    $("#statsDiff" + htmlSafeWorkerName).text(statData.workers[w].diff);
  }
}

function addWorkerToDisplay(name, htmlSafeName, workerObj) {
  var htmlToAdd = "";


  htmlToAdd += '<div class="col-md-2"><div class="card"><div class="card-header h5" style="background:#343a40;color:white; font-size:14px">' + name + '</div><div class="card-block">';
  htmlToAdd += '<p><i class="fa fa-tachometer"></i> <span id="statsHashrate' + htmlSafeName + '">' + getReadableHashRateString(workerObj.hashrate) + '</span> (Now)</p>';
  htmlToAdd += '<p><i class="fa fa-tachometer"></i> <span id="statsHashrateAvg' + htmlSafeName + '">' + getReadableHashRateString(calculateAverageHashrate(name)) + '</span> (Avg)</p>';
  htmlToAdd += '<p><i class="fa fa-shield"></i> <small>Diff:</small> <span id="statsDiff' + htmlSafeName + '">' + workerObj.diff + '</span></p>';
  htmlToAdd += '<p><i class="fa fa-cog"></i> <small>Shares:</small> <span id="statsShares' + htmlSafeName + '">' + (Math.round(workerObj.currRoundShares * 100) / 100) + '</span></p>';
  htmlToAdd += '<p><i class="fa fa-gavel"></i> <small>Luck <span id="statsLuckDays' + htmlSafeName + '">' + workerObj.luckDays + '</span> Days</small></p>';
  htmlToAdd += '<p><i class="fa fa-money"></i> <small>Bal: <span id="statsBalance' + htmlSafeName + '">' + workerObj.balance + '</span></small></p>';
  htmlToAdd += '<p><i class="fa fa-money"></i> <small>Paid: <span id="statsPaid' + htmlSafeName + '">' + workerObj.paid + '</span></small></p></div></div></div>';
  return htmlToAdd;


}

function objectLength(obj) {
  var result = 0;
  for(var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      // or Object.prototype.hasOwnProperty.call(obj, prop)
      result++;
    }
  }
  return result;
}

function toStandardizedDate(epoch) {
  var utcDate = new Date(epoch);

  return utcDate.toLocaleString();
}

function paymentList() {
  var x = 0
  var htmlpayadd = "";
  for (var i in workerPaymentJson) {
    for (var p in workerPaymentJson[i].payments) {
      for (var t in workerPaymentJson[i].payments[p].amounts) {
        if (t.startsWith(_miner)) {
          if(x < 5){
            htmlpayadd += '<tr>';
            htmlpayadd += '<td>' + toStandardizedDate(workerPaymentJson[i].payments[p].time) + '</td>';
            htmlpayadd += '<td><a href="https://explorer.bitcoinz.site/tx/' + workerPaymentJson[i].payments[p].txid + '" title="View transaction" target="_blank"> ' + workerPaymentJson[i].payments[p].blocks + '</a></td>';
            htmlpayadd += '<td>' + (workerPaymentJson[i].payments[p].amounts[t]).toFixed(4) + ' Bitcoinz</td>';
            htmlpayadd += '</tr>';
            x++
          }
        }
      }
    }
  }
  $("#paymentlist tbody").append(htmlpayadd);
}

function rebuildWorkerDisplay() {
  $("#boxesWorkers").html("");
  var html = '';
  var i = 0;
  var rowcount = 0;
  var totalCount = objectLength(statData.workers);

  for (var w in statData.workers) {
    i++;
    rowcount++;
    var htmlSafeWorkerName = w.split('.').join('_').replace(/[^\w\s]/gi, '');
    var saneWorkerName = getWorkerNameFromAddress(w);
    if(rowcount < 6){
      if(rowcount == 1){
        html += '<div class="row">'
      }
      html += addWorkerToDisplay(saneWorkerName, htmlSafeWorkerName, statData.workers[w]);
      if(rowcount == 5 || totalCount == i){
        html += '</div>'
        rowcount = 0;
      }
    }


  }
  $("#boxesWorkers").html($("#boxesWorkers").html()+html);

}
nv.utils.windowResize(triggerChartUpdates);
$.getJSON('/api/worker_stats?' + _miner, function(data) {
  delete window.statData;
  window.statData = data;
  for (var w in statData.workers) {
    _workerCount++;
  }
  buildChartData();
  displayCharts();
  rebuildWorkerDisplay();
  updateStats();
});

$.getJSON('/api/payments', function(data) {
  workerPaymentJson = data;
  console.log(data);
  paymentList();
});

statsSource.addEventListener('message', function(e) {
  $.getJSON('/api/worker_stats?' + _miner, function(data) {
    statData = data;
    var wc = 0;
    var rebuilt = false;
    for (var w in statData.workers) {
      wc++;
    }
    if (_workerCount != wc) {
      if (_workerCount > wc) {
        rebuildWorkerDisplay();
        rebuilt = true;
      }
      _workerCount = wc;
    }
    rebuilt = (rebuilt || updateChartData());
    updateStats();
    if (!rebuilt) {
      updateWorkerStats();
    }
  });
  $.getJSON('/api/stats', function(data) {
    poolData = data;
  });
});
