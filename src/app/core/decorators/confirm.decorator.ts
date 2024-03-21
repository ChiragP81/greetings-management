import { DialogService } from '@services/dialog.service';

export function Confirm(name?: string) {
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const isConfirm = await DialogService.getInstance().confirmDialog(name);
      if (isConfirm) {
        originalMethod.apply(this, args);
      } else {
        DialogService.getInstance().closeConfirmDialog();
      }
    };
    return descriptor;
  };
}
