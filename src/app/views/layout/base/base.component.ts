import { AfterViewChecked, ChangeDetectorRef, Component } from "@angular/core";
import {
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { CommonService } from "../../../services/common/common.service";
import { SpinnerService } from "../../../services/spinner/spinner.service";

@Component({
  selector: "app-base",
  templateUrl: "./base.component.html",
  styleUrls: ["./base.component.scss"],
})
export class BaseComponent implements AfterViewChecked {
  isLoading: any;

  constructor(
    public spinner: SpinnerService,
    public router: Router,
    public common: CommonService,
    private cdRef: ChangeDetectorRef
  ) {
    router.events.forEach((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.spinner.show();
      } else if (event instanceof RouteConfigLoadEnd) {
        this.spinner.hide();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }
}
