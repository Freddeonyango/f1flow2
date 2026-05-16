const F1FLOW_DATABASE_KEY = "f1flow.database.v1";

const F1FLOW_DATABASE_SEED = {
  meta: {
    name: "F1Flow local browser database",
    version: 1,
    adapter: "localStorage"
  },
  users: [
    {
      id: "user-fredrick",
      name: "Fredrick Kamau",
      country: "Kenya",
      status: "Current F-1 Student",
      university: "Indiana University Bloomington",
      programStart: "2023-08",
      graduation: "2025-05",
      field: "Health Informatics"
    }
  ],
  appState: {
    activeUserId: "user-fredrick",
    checklist: {
      "Book temporary housing": true,
      "Airport pickup arranged": true,
      "Get a SIM card": false,
      "Open a bank account": false,
      "Campus check-in and I-20": false,
      "Get health insurance card": false,
      "Apply for SSN if eligible": false,
      "Get driver's license": false
    },
    posts: [],
    ideas: [],
    actionLog: [],
    savedPosts: [],
    travelMemberships: [],
    mentorRequests: [],
    serviceViews: [],
    recommendationRequests: {},
    theme: "light"
  }
};

function cloneRecord(value) {
  return structuredClone(value);
}

const F1FlowDatabase = {
  load() {
    const saved = localStorage.getItem(F1FLOW_DATABASE_KEY);
    if (!saved) {
      const seeded = cloneRecord(F1FLOW_DATABASE_SEED);
      this.save(seeded);
      return seeded;
    }

    return {
      ...cloneRecord(F1FLOW_DATABASE_SEED),
      ...JSON.parse(saved)
    };
  },

  save(database) {
    localStorage.setItem(F1FLOW_DATABASE_KEY, JSON.stringify(database));
    return database;
  },

  getState(defaults) {
    const database = this.load();
    const activeUser = database.users.find(user => user.id === database.appState.activeUserId) || database.users[0];

    return {
      ...cloneRecord(defaults),
      ...database.appState,
      profile: {...defaults.profile, ...(activeUser || {})},
      checklist: {...defaults.checklist, ...(database.appState.checklist || {})},
      recommendationRequests: {
        ...defaults.recommendationRequests,
        ...(database.appState.recommendationRequests || {})
      }
    };
  },

  setState(state) {
    const database = this.load();
    const activeUserId = database.appState.activeUserId || "user-fredrick";
    const profile = {...state.profile, id: activeUserId};
    const existingUserIndex = database.users.findIndex(user => user.id === activeUserId);

    if (existingUserIndex >= 0) {
      database.users[existingUserIndex] = profile;
    } else {
      database.users.push(profile);
    }

    database.appState = {
      ...database.appState,
      activeUserId,
      checklist: state.checklist,
      posts: state.posts,
      ideas: state.ideas,
      actionLog: state.actionLog,
      savedPosts: state.savedPosts,
      travelMemberships: state.travelMemberships,
      mentorRequests: state.mentorRequests,
      serviceViews: state.serviceViews,
      recommendationRequests: state.recommendationRequests,
      theme: state.theme
    };

    return this.save(database);
  },

  reset() {
    return this.save(cloneRecord(F1FLOW_DATABASE_SEED));
  }
};

window.F1FlowDatabase = F1FlowDatabase;
