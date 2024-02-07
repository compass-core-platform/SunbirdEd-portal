import { OfflinePlugins } from './modules/public/module/offline/plugin';
import { OfflineModule } from './modules/public/module/offline/';

export const WebExtensionsConfig = {
  plugins: [
    {
    'id': 'offline-plugins',
    'ver': '1.0.0',
    'module': OfflineModule,
    'main': OfflinePlugins
  }
]
};

export const PluginModules = [ OfflineModule ];

export const TaxonomyCategories = ['taxonomyCategory1', 'taxonomyCategory2', 'taxonomyCategory3', 'taxonomyCategory4', 'taxonomyCategory5'];

export const taxonomyEnvironment = {
  production: false,
  url: '',
  token: '',
  frameworkName: 'fracing_fw',
  channelId: 'tarento',
  authToken: '',
  userToken:'',
  isApprovalRequired: false,
  additionalProperties: ["taxonomyCategory4"]
};

export const taxonomyConfig = [
  {
    "frameworkId" :"TLP_FW",
    "config" : [
        {   
            "index": 1,
            "category": "taxonomyCategory1",
            "icon": "settings",
            "color": "#1d2327"
        },
        {   
            "index": 2,
            "category": "taxonomyCategory2",
            "icon": "extension",
            "color": "#541675"
        },
        {   
            "index": 3,
            "category": "taxonomyCategory3",
            "icon": "bar_chart",
            "color": "#9a6c80"
        },
        {   
            "index": 4,
            "category": "taxonomyCategory4",
            "icon": "account_box",
            "color": "#d8666a"
        },
        {   
            "index": 5,
            "category": "taxonomyCategory5",
            "icon": "bar_chart",
            "color": "#ed8699"
        }
    ]
  },
  {
    "frameworkId" :"dpg_fw",
    "config" : [
        {   
            "index": 1,
            "category": "taxonomyCategory1",
            "icon": "settings",
            "color": "#1d2327"
        },
        {   
            "index": 2,
            "category": "taxonomyCategory2",
            "icon": "extension",
            "color": "#541675"
        },
        {   
            "index": 3,
            "category": "taxonomyCategory3",
            "icon": "bar_chart",
            "color": "#9a6c80"
        },
        {   
            "index": 4,
            "category": "taxonomyCategory4",
            "icon": "account_box",
            "color": "#d8666a"
        },
        {   
            "index": 5,
            "category": "taxonomyCategory5",
            "icon": "bar_chart",
            "color": "#ed8699"
        }
    ]
  }
]
