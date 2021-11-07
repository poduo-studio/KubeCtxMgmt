import { Component, OnInit } from '@angular/core';
import { dump, load } from "js-yaml";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";


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

  formGroup: FormGroup;

  get clusters(): FormArray {
    return this.formGroup.get('clusters') as FormArray;
  }

  get users(): FormArray {
    return this.formGroup.get('users') as FormArray;
  }

  get contexts(): FormArray {
    return this.formGroup.get('contexts') as FormArray;
  }

  constructor(private fb: FormBuilder) {
    this.formGroup = fb.group({
      clusters: fb.array([]),
      users: fb.array([]),
      contexts: fb.array([]),
    });
  }


  ngOnInit(): void {
    if (localStorage['yamlText']) {
      this.yamlText = localStorage['yamlText'];
    }
  }

  onLoad() {
    this.clusters.clear();
    this.users.clear();
    this.contexts.clear();
    if (this.yamlText) {
      localStorage['yamlText'] = this.yamlText;
      this.yamlObj = load(this.yamlText) as KubeConfig;
      for (let item of this.yamlObj.clusters) {
        this.clusters.push(this.fb.group({
          'name': this.fb.control(item.name),
          'cluster': this.fb.group({
            'server': this.fb.control(item.cluster.server)
          }),
        }))
      }
      for (let item of this.yamlObj.users) {
        this.users.push(this.fb.group({
          'name': this.fb.control(item.name),
        }))
      }
      for (let item of this.yamlObj.contexts) {
        this.contexts.push(this.fb.group({
          'name': this.fb.control(item.name),
          'context': this.fb.group({
            'cluster': this.fb.control(item.context.cluster),
            'namespace': this.fb.control(item.context.namespace),
            'user': this.fb.control(item.context.user),
          }),
        }))
      }
    }
  }

  onDump() {
    this.yamlText = dump(this.yamlObj);
  }
}
