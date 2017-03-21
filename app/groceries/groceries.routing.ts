import { ModuleWithProviders }  from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { GroceriesComponent } from "./groceries.component";
import { AuthGuard } from "../auth-guard.service";

const groceriesRoutes: Routes = [
  // { path: "groceries", component: GroceriesComponent, canActivate: [AuthGuard] },
  { path: "groceries", component: GroceriesComponent },
];
export const groceriesRouting: ModuleWithProviders = RouterModule.forChild(groceriesRoutes);