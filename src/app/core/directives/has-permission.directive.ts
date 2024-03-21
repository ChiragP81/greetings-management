import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { MemberService } from '@services/member.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private memberService: MemberService
  ) { }

  ngOnInit() {
    if (this.memberService.hasRole() && this.templateRef) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
