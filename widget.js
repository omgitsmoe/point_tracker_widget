let userLocale = "en-US",
    includeFollowers = true,
    includeRedemptions = true,
    includeHosts = true,
    includeSubs = true,
    includeTips = true,
    includeCheers = true,
    currentPoints = 0,
    pointsGoal = 0,
    globalMultiplier = 1,
    tier1Multiplier = 1,
    tier2Multiplier = 2,
    tier3Multiplier = 5,
    followerMultiplier = 1,
    subscriberMultiplier = 1,
    cheersPerPoint = 100,
    tipsMultiplier = 1;

let userCurrency;

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;
  	parseEvent(listener, event);
});

window.addEventListener('onWidgetLoad', function (obj) {
    let recents = obj.detail.recents;
    recents.sort(function (a, b) {
        return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
    userCurrency = obj.detail.currency;
    const fieldData = obj.detail.fieldData;
    eventsLimit = fieldData.eventsLimit;
    includeFollowers = (fieldData.includeFollowers === "yes");
    includeRedemptions = (fieldData.includeRedemptions === "yes");
    includeHosts = (fieldData.includeHosts === "yes");
    includeSubs = (fieldData.includeSubs === "yes");
    includeTips = (fieldData.includeTips === "yes");
    includeCheers = (fieldData.includeCheers === "yes");
  	currentPoints = fieldData.currentPoints;
  	pointsGoal = fieldData.pointsGoal;
  	globalMultiplier = fieldData.globalMultiplier;
  	tier1Multiplier = fieldData.tier1Multiplier;
    tier2Multiplier = fieldData.tier2Multiplier;
    tier3Multiplier = fieldData.tier3Multiplier;
    followerMultiplier = fieldData.followerMultiplier;
    subscriberMultiplier = fieldData.subscriberMultiplier;
    cheersPerPoint = fieldData.cheersPerPoint;
    tipsMultiplier = fieldData.tipsMultiplier;
    userLocale = fieldData.locale;
    
  	// NOTE: there are a bunch of test events coming in that can't
    // be turned off??
    // let eventIndex;
    // for (eventIndex = 0; eventIndex < recents.length; eventIndex++) {
    //   const event = recents[eventIndex];
    //   parseEvent(event.type, event);
    // }
  
    updateProgressBar();
});

function parseEvent(eventType, event) {
  console.log('EVENT', eventType, event);
  if (eventType === 'follower') {
    if (includeFollowers) {
      processEvent('follower', 1);
    }
  } else if (eventType === 'subscriber') {
    if (includeSubs) {
      let tierMultiplier = tier1Multiplier;
      if (event.tier === 2000) {
        tierMultiplier = tier2Multiplier;
      } else if (event.tier === 3000) {
        tierMultiplier = tier3Multiplier;
      }

      // event.amount is the months subbed, not the amount gifted etc.
      const tierApplied = 1 * tierMultiplier;
      processEvent('subscriber', tierApplied);
    }
  } else if (eventType === 'cheer') {
    if (includeCheers) {
      processEvent('cheer', event.amount);
    }
  } else if (eventType === 'tip') {
    if (includeTips) {
      processEvent('tip', event.amount);
    }
  }
}

function updateProgressBar() {
  const currentText = document.getElementById('progress-current');
  const fill = document.getElementById('progress-fill');
  const progressInPercent = currentPoints / pointsGoal * 100;
  fill.style.width = `${progressInPercent}%`;
  currentText.textContent = currentPoints;
}

function processEvent(type, amount) {
  let typeMultiplier = 1;
  if (type === 'follower') {
    typeMultiplier = followerMultiplier;
  } else if (type === 'subscriber') {
    typeMultiplier = subscriberMultiplier;
  } else if (type === 'cheer') {
    typeMultiplier = 1 / cheersPerPoint;
  } else if (type === 'tip') {
    typeMultiplier = tipsMultiplier;
  }
  
  currentPoints += amount * typeMultiplier * globalMultiplier;
  
  updateProgressBar();
}

