import { ILocalStorageService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { ComponentManager } from './Common/ComponentManager';
import { ZIndexManager } from './Common/ZIndexManager';
import { SharedController } from './controllers/shared-shortcut.controller';
import { IUIController, IWorkbenchOptions } from './controllers/ui/ui.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { BrowserClipboardService, IClipboardInterfaceService } from './services/clipboard/clipboard-interface.service';
import { DesktopContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
import { DesktopFocusService, IFocusService } from './services/focus/focus.service';
import { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
import { DesktopMenuService, IMenuService } from './services/menu/menu.service';
import { DesktopMessageService } from './services/message/desktop-message.service';
import { IMessageService } from './services/message/message.service';
import { DesktopNotificationService } from './services/notification/desktop-notification.service';
import { INotificationService } from './services/notification/notification.service';
import { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
import { DesktopShortcutService, IShortcutService } from './services/shortcut/shortcut.service';

export interface IUIPluginConfig extends IWorkbenchOptions {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
export class UIPlugin extends Plugin {
    protected override _injector: Injector;

    static override type = PluginType.Univer;

    private _config: IUIPluginConfig;

    constructor(config: Partial<IUIPluginConfig> = {}, @Inject(Injector) injector: Injector) {
        super(PLUGIN_NAMES.BASE_UI);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._injector = injector;
    }

    override onStarting(): void {
        this._initDependencies();
        this._initModules();
    }

    override onReady(): void {
        this._initUI();
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            // legacy managers - deprecated
            [ComponentManager],
            [ZIndexManager],
            // services
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IMenuService, { useClass: DesktopMenuService }],
            [IContextMenuService, { useClass: DesktopContextMenuService }],
            [IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }],
            [INotificationService, { useClass: DesktopNotificationService, lazy: true }],
            [IMessageService, { useClass: DesktopMessageService, lazy: true }],
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            // controllers
            [IFocusService, { useClass: DesktopFocusService }],
            [SharedController],
            [IUIController, { useClass: DesktopUIController }],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    private _initModules(): void {
        this._injector.get(SharedController).initialize();
    }

    private _initUI(): void {
        Promise.resolve().then(() => this._injector.get(IUIController).bootstrapWorkbench(this._config));
    }
}
