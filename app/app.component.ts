import { Component, ViewChild, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import {
    GridComponent,
    GridDataResult,
    DataStateChangeEvent,
    State
 } from '@progress/kendo-angular-grid';

// Include progress JSDO module
import a = require('./progress/progress');
let progress: any = a.progress;

/* Example service */
@Injectable()
export class CategoriesService extends BehaviorSubject<GridDataResult> {
    private tableName: string = 'Categories';
    private jsdo: any;

    constructor(private http: Http) {
        super(null);

        const serviceURI = 'http://oemobiledemo.progress.com/CustomerService';
        const catalogURI = 'http://oemobiledemo.progress.com/CustomerService/static/mobile/CustomerService.json';

        // TODO: Change Session to JSDOSession
        let session = new progress.data.Session();
        session.login(serviceURI, '', '');

        session.addCatalog(catalogURI);

        let jsdo1 = new progress.data.JSDO({ name: 'Customer' });
        this.jsdo = jsdo1;
    }

    public query(state: any): void {
        this.fetch(this.tableName, state)
            .subscribe(x => super.next(x));
    }

    private fetch(tableName: string, state: State): Observable<GridDataResult> {
        let that = this;
        let query = {
            skip: state.skip,
            top: state.take
        };
        let promise = new Promise((resolve, reject) => {
            let afterFill = (jsdo: any, success: any, request: any) => {
                    jsdo.unsubscribe('AfterFill', afterFill, this);

                    if (success) {
                        let data = jsdo.getData();

                        if (query.top) {
                            let afterInvoke = (jsdo1: any, success1: any, request1: any): void => {
                                jsdo.unsubscribe('AfterInvoke', 'count', afterInvoke, this);

                                resolve(<GridDataResult>{
                                    data: data,
                                    total: request1.response.numRecs
                                });
                            };
                            jsdo.subscribe('AfterInvoke', 'count', afterInvoke, this);
                            jsdo.count(query);
                        } else {
                            resolve(<GridDataResult>{
                                data: data,
                                total: data.length
                            });
                        }
                    } else {
                        reject(new Error('Error while executing query'));
                    }
                };
            that.jsdo.subscribe('AfterFill', afterFill, this);
            that.jsdo.fill(query);
        });

        let result = Observable.fromPromise(promise)
            .map((ret: GridDataResult) => (<GridDataResult>{
                data: ret.data,
                total: ret.total
            }));

        return result;
    }
}
@Component({
  providers: [CategoriesService],
  selector: 'my-app',
  template: `
      <kendo-grid
          [data]="view | async"
          [pageSize]="pageSize"
          [skip]="skip"
          [pageable]="true"
        >
        <kendo-grid-column field="CustNum" width="100"></kendo-grid-column>
        <kendo-grid-column field="Name" width="200"></kendo-grid-column>
        <kendo-grid-column field="SalesRep"></kendo-grid-column>
      </kendo-grid>
  `
})

export class AppComponent {
    private view: Observable<GridDataResult>;
    private pageSize: number = 5;
    private skip: number  = 0;

    @ViewChild(GridComponent) private grid: GridComponent;
    constructor(private service: CategoriesService) {
        this.view = service;

        this.service.query({ skip: this.skip, take: this.pageSize });
    }

    public ngAfterViewInit(): void {
        this.grid.dataStateChange
            .do(({ skip, take }: DataStateChangeEvent) => {
                this.skip = skip;
                this.pageSize = take;

                window.alert (this.sort);
            })
            .subscribe(x => this.service.query(x));
    }
}
