import { Injectable, NgZone } from "@angular/core";
import { Http, Headers, Response, ResponseOptions } from "@angular/http";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import "rxjs/add/operator/map";

import { BackendService } from "../../shared";
import { Grocery } from "./grocery.model";
import firebase = require("nativescript-plugin-firebase");
@Injectable()
export class GroceryService {
  items: BehaviorSubject<Array<Grocery>> = new BehaviorSubject([]);

  private allItems: Array<Grocery> = [];

  constructor(private http: Http, private zone: NgZone) { }

  load() {
    let headers = this.getHeaders();
    headers.append("X-Everlive-Sort", JSON.stringify({ ModifiedAt: -1 }));

    return this.http.get(BackendService.apiUrl + "Groceries", {
      headers: headers
    })
    .map(res => res.json())
    .map(data => {
      data.Result.forEach((grocery) => {
        this.allItems.push(
          new Grocery(
            grocery.Id,
            grocery.Name,
            grocery.Done || false,
            grocery.Deleted || false
          )
        );
        this.publishUpdates();
      });
    })
    .catch(this.handleErrors);
  }


  // load() {
  //   var onQueryEvent = function(result) {
  //     // note that the query returns 1 match at a time
  //     // in the order specified in the query
  //     if (!result.error) {
  //       console.log("Event type: " + result.type);
  //       console.log("Key: " + result.key);
  //       console.log("Value: " + JSON.stringify(result.value));
  //     }
  //   };
  //
  //   firebase.query(
  //       onQueryEvent,
  //       "/companies",
  //       {
  //         // set this to true if you want to check if the value exists or just want the event to fire once
  //         // default false, so it listens continuously.
  //         // Only when true, this function will return the data in the promise as well!
  //         singleEvent: true,
  //         // order by company.country
  //         orderBy: {
  //           type: firebase.QueryOrderByType.CHILD,
  //           value: 'since' // mandatory when type is 'child'
  //         },
  //         // but only companies 'since' a certain year (Telerik's value is 2000, which is imaginary btw)
  //         // use either a 'range'
  //         //range: {
  //         //    type: firebase.QueryRangeType.EQUAL_TO,
  //         //    value: 2000
  //         ///},
  //         // .. or 'chain' ranges like this:
  //         ranges: [
  //           {
  //             type: firebase.QueryRangeType.START_AT,
  //             value: 1999
  //           },
  //           {
  //             type: firebase.QueryRangeType.END_AT,
  //             value: 2000
  //           }
  //         ],
  //         // only the first 2 matches
  //         // (note that there's only 1 in this case anyway)
  //         limit: {
  //           type: firebase.QueryLimitType.LAST,
  //           value: 2
  //         }
  //       }
  //   );
  // }

  // add(name: string) {
  //   return this.http.post(
  //     BackendService.apiUrl + "Groceries",
  //     JSON.stringify({ Name: name }),
  //     { headers: this.getHeaders() }
  //   )
  //   .map(res => res.json())
  //   .map(data => {
  //     this.allItems.unshift(new Grocery(data.Result.Id, name, false, false));
  //     this.publishUpdates();
  //   })
  //   .catch(this.handleErrors);
  // }

  add(name: string) {
    return firebase.push(
        '/Groceries',
        {
          'id': '1',
          'name': 'Verbruggen',
          'done': false,
          'deleted': false
        }
    )
  }


  setDeleteFlag(item: Grocery) {
    return this.put(item.id, { Deleted: true, Done: false })
      .map(res => res.json())
      .map(data => {
        item.deleted = true;
        item.done = false;
        this.publishUpdates();
      });
  }

  toggleDoneFlag(item: Grocery) {
    item.done = !item.done;
    this.publishUpdates();
    return this.put(item.id, { Done: item.done })
      .map(res => res.json());
  }

  restore() {
    let indeces = [];
    this.allItems.forEach((grocery) => {
      if (grocery.deleted && grocery.done) {
        indeces.push(grocery.id);
      }
    });

    let headers = this.getHeaders();
    headers.append("X-Everlive-Filter", JSON.stringify({
      "Id": {
        "$in": indeces
      }
    }));

    return this.http.put(
      BackendService.apiUrl + "Groceries",
      JSON.stringify({
        Deleted: false,
        Done: false
      }),
      { headers: headers }
    )
    .map(res => res.json())
    .map(data => {
      this.allItems.forEach((grocery) => {
        if (grocery.deleted && grocery.done) {
          grocery.deleted = false;
          grocery.done = false;
        }
      });
      this.publishUpdates();
    })
    .catch(this.handleErrors);
  }

  permanentlyDelete(item: Grocery) {
    return this.http
      .delete(
        BackendService.apiUrl + "Groceries/" + item.id,
        { headers: this.getHeaders() }
      )
      .map(res => res.json())
      .map(data => {
        let index = this.allItems.indexOf(item);
        this.allItems.splice(index, 1);
        this.publishUpdates();
      })
      .catch(this.handleErrors);
  }

  private put(id: string, data: Object) {
    return this.http.put(
      BackendService.apiUrl + "Groceries/" + id,
      JSON.stringify(data),
      { headers: this.getHeaders() }
    )
    .catch(this.handleErrors);
  }

  private publishUpdates() {
    // Make sure all updates are published inside NgZone so that change detection is triggered if needed
    this.zone.run(() => {
      // must emit a *new* value (immutability!)
      this.items.next([...this.allItems]);
    });
  }

  private getHeaders() {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + BackendService.token);
    return headers;
  }

  private handleErrors(error: Response) {
    console.log(error);
    return Observable.throw(error);
  }
}