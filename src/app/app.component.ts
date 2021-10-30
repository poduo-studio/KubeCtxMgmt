import { Component, OnInit } from '@angular/core';
import { load } from "js-yaml";


interface Extension {
  'last-update': Date;
  provider: string;
  version: string;
}

interface Extensions {
  extension: Extension;
  name: string;
}

interface Cluster {
  'certificate-authority-data': string;
  'certificate-authority': string;
  extensions: Extensions;
  server: string;
}

interface Clusters {
  cluster: Cluster;
  name: string;
}

interface Context {
  cluster: string;
  namespace: string;
  user: string;
}

interface Contexts {
  context: Context;
  name: string;
}

interface User {
  'client-key-data': string;
  'token': string;
  'client-certificate-data': string;
  'client-certificate': string;
  'client-key': string;
}

interface Users {
  user: User;
  name: string;
}

interface KubeConfig {
  apiVersion: string;
  'current-context': string;
  'kind': string;
  clusters: Clusters[]
  contexts: Contexts[];
  users: Users[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'KubeCtxMgmt';

  yamlText: string = ``;
  yamlObj: KubeConfig | undefined;

  clusters: Clusters[] = [];
  users: Users[] = [];
  contexts: Contexts[] = [];

  ngOnInit(): void {
    if (localStorage['yamlText']) {
      this.yamlText = localStorage['yamlText'];
    }
  }

  onBlur() {
    localStorage['yamlText'] = this.yamlText;
    this.yamlObj = load(this.yamlText) as KubeConfig;
    for (let item of this.yamlObj.clusters) {
      this.clusters.push(item);
    }
    for (let item of this.yamlObj.users) {
      this.users.push(item);
    }
    for (let item of this.yamlObj.contexts) {
      this.contexts.push(item);
    }
  }
}
