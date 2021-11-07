import { Component, OnInit } from '@angular/core';
import { dump, load } from "js-yaml";
import { AbstractControl, FormArray, FormBuilder, FormGroup } from "@angular/forms";


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
  kind: string;
  preferences: Object;
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
  selectedContext: FormGroup | undefined;
  selectedCluster: FormGroup | undefined;
  selectedUser: FormGroup | undefined;

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
      apiVersion: '',
      kind: '',
      preferences: '',
      clusters: fb.array([]),
      users: fb.array([]),
      contexts: fb.array([]),
    });
  }


  ngOnInit(): void {
    if (sessionStorage['yamlText']) {
      this.yamlText = sessionStorage['yamlText'];
    }
    if (this.yamlText === undefined || this.yamlText === '') {
      this.yamlText =
        `
apiVersion: v1
kind: Config
preferences: {}

clusters:
- cluster:
  name: development
- cluster:
  name: scratch

users:
- name: developer
- name: experimenter

contexts:
- context:
  name: dev-frontend
- context:
  name: dev-storage
- context:
  name: exp-scratch

`
    }
  }

  onLoad() {
    this.clusters.clear();
    this.users.clear();
    this.contexts.clear();
    this.selectedContext = undefined;
    this.selectedCluster = undefined;
    this.selectedUser = undefined;
    if (this.yamlText) {
      sessionStorage['yamlText'] = this.yamlText;
      this.yamlObj = load(this.yamlText) as KubeConfig;
      this.formGroup.patchValue({
        apiVersion: this.yamlObj.apiVersion,
        kind: this.yamlObj.kind,
        preferences: this.yamlObj.preferences,
      });
      for (let item of this.yamlObj.clusters) {
        const g = {
          name: this.fb.control(item.name),
          cluster: this.fb.group({
            'server': '',
            'certificate-authority-data': '',
            'certificate-authority': '',
          }),
        };
        if (item.cluster !== null && item.cluster !== undefined) {
          g['cluster'] = this.fb.group({
            server: this.fb.control(item.cluster?.server),
            'certificate-authority-data': this.fb.control(item.cluster['certificate-authority-data']),
            'certificate-authority': this.fb.control(item.cluster['certificate-authority']),
          });
        }
        this.clusters.push(this.fb.group(g));
      }
      for (let item of this.yamlObj.users) {
        const g = {
          name: this.fb.control(item.name),
          cluster: this.fb.group({
            'client-certificate-data': '',
            'client-certificate': '',
            'client-key-data': '',
            'client-key': '',
        }),
        };
        if (item.user !== null && item.user !== undefined) {
          g['cluster'] =this.fb.group({
            'client-certificate-data': this.fb.control(item.user['client-certificate-data']),
            'client-certificate': this.fb.control(item.user['client-certificate']),
            'client-key-data': this.fb.control(item.user['client-key-data']),
            'client-key': this.fb.control(item.user['client-key']),
          });
        }
        this.users.push(this.fb.group(g));
      }
      for (let item of this.yamlObj.contexts) {
        const g = {
          name: this.fb.control(item.name),
          context: this.fb.group({
            cluster: '',
            user: '',
            namespace: '',
          }),
        };
        if (item.context != null && item.context !== undefined) {
          g['context'] = this.fb.group({
            cluster: this.fb.control(item.context?.cluster),
            user: this.fb.control(item.context?.user),
            namespace: this.fb.control(item.context?.namespace),
          });
        }
        this.contexts.push(this.fb.group(g));
      }
    }
  }

  onDump() {
    this.yamlText = dump(this.formGroup.value);
  }

  onSelectContext(item: AbstractControl) {
    this.selectedContext = item as FormGroup;
  }

  onSelectCluster(item: AbstractControl) {
    this.selectedCluster = item as FormGroup;
  }

  onSelectUser(item: AbstractControl) {
    this.selectedUser = item as FormGroup;
  }
}
