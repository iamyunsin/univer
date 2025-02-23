import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
} from '@univerjs/base-sheets';
import { DisplayTypes, IMenuButtonItem, IMenuSelectorItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { ICommandService, IPermissionService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export function CellMergeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeCommand.id,
        title: 'merge',
        icon: 'MergeIcon',
        tooltip: 'toolbar.mergeCell.main',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR],
        type: MenuItemType.SUBITEMS,
        // selections: [...MERGE_CHILDREN],
    };
}
export function CellMergeAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.all',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeVerticalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeVerticalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.vertical',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeHorizontalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: AddWorksheetMergeHorizontalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.horizontal',
        positions: [AddWorksheetMergeCommand.id],
    };
}
export function CellMergeCancelMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);

    return {
        id: RemoveWorksheetMergeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.cancel',
        positions: [AddWorksheetMergeCommand.id],
    };
}
