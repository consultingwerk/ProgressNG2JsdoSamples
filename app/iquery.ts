import {
    SortDescriptor
 } from '@progress/kendo-angular-grid';

export interface IQuery {
  skip: number;
  top: number;
  filter: string;
  sort: SortDescriptor[];
}
