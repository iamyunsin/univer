import { IRenderManagerService } from '@univerjs/base-render';
import { Disposable, LifecycleService, LifecycleStages, toDisposable } from '@univerjs/core';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import React, { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { Observable, Subject } from 'rxjs';

import { IFocusService } from '../../services/focus/focus.service';
import { App } from '../../views/app';
import { IUIController, IWorkbenchOptions } from './ui.controller';

/**
 * IDesktopUIController
 */
export interface IDesktopUIController extends IUIController {
    componentRegistered$: Observable<void>;

    // provides multi methods for business to register workbench custom components
    // TODO@wzhudev: in the future we may bind components to different business types

    // header bar
    registerHeaderComponent(component: () => ComponentType): IDisposable;
    getHeaderComponents(): Set<() => ComponentType>;

    // content
    registerContentComponent(component: () => ComponentType): IDisposable;
    getContentComponents(): Set<() => ComponentType>;

    // footer bar
    registerFooterComponent(component: () => ComponentType): IDisposable;
    getFooterComponents(): Set<() => ComponentType>;

    registerSidebarComponent(component: () => ComponentType): IDisposable;
    getSidebarComponents(): Set<() => ComponentType>;
}

const STEADY_TIMEOUT = 3000;

export class DesktopUIController extends Disposable implements IDesktopUIController {
    private _headerComponents: Set<() => ComponentType> = new Set();

    private _contentComponents: Set<() => ComponentType> = new Set();

    private _footerComponents: Set<() => ComponentType> = new Set();

    private _sidebarComponents: Set<() => ComponentType> = new Set();

    private _componentRegistered$ = new Subject<void>();
    componentRegistered$ = this._componentRegistered$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IFocusService private readonly _focusService: IFocusService
    ) {
        super();
    }

    bootstrapWorkbench(options: IWorkbenchOptions): void {
        this.disposeWithMe(
            bootStrap(this._injector, options, (canvasElement, containerElement) => {
                this._initializeEngine(canvasElement);
                this._lifecycleService.stage = LifecycleStages.Rendered;
                this._focusService.setContainerElement(containerElement);

                setTimeout(() => (this._lifecycleService.stage = LifecycleStages.Steady), STEADY_TIMEOUT);
            })
        );
    }

    private _initializeEngine(element: HTMLElement) {
        const engine = this._renderManagerService.getCurrent()!.engine;
        engine.setContainer(element);
    }

    registerHeaderComponent(component: () => ComponentType): IDisposable {
        this._headerComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._headerComponents.delete(component));
    }

    getHeaderComponents(): Set<() => ComponentType> {
        return new Set([...this._headerComponents]);
    }

    registerContentComponent(component: () => ComponentType): IDisposable {
        this._contentComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._contentComponents.delete(component));
    }

    getContentComponents(): Set<() => ComponentType> {
        return new Set([...this._contentComponents]);
    }

    registerFooterComponent(component: () => ComponentType): IDisposable {
        this._footerComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._footerComponents.delete(component));
    }

    getFooterComponents(): Set<() => ComponentType> {
        return new Set([...this._footerComponents]);
    }

    registerSidebarComponent(component: () => ComponentType): IDisposable {
        this._sidebarComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._footerComponents.delete(component));
    }

    getSidebarComponents(): Set<() => React.ComponentType> {
        return new Set([...this._sidebarComponents]);
    }
}

function bootStrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (canvasEl: HTMLElement, containerElement: HTMLElement) => void
): IDisposable {
    let mountContainer: HTMLElement;

    const container = options.container;
    if (typeof container === 'string') {
        const containerElement = document.getElementById(container);
        if (!containerElement) {
            mountContainer = createContainer(container);
        } else {
            mountContainer = containerElement;
        }
    } else if (container instanceof HTMLElement) {
        mountContainer = container;
    } else {
        mountContainer = createContainer('univer');
    }

    const root = createRoot(mountContainer);
    const ConnectedApp = connectInjector(App, injector);
    const desktopUIController = injector.get(IUIController) as IDesktopUIController;
    const onRendered = (canvasElement: HTMLElement) => callback(canvasElement, mountContainer);

    function render() {
        const headerComponents = desktopUIController.getHeaderComponents();
        const contentComponents = desktopUIController.getContentComponents();
        const footerComponents = desktopUIController.getFooterComponents();
        const sidebarComponents = desktopUIController.getSidebarComponents();
        root.render(
            <ConnectedApp
                {...options}
                headerComponents={headerComponents}
                contentComponents={contentComponents}
                onRendered={onRendered}
                footerComponents={footerComponents}
                sidebarComponents={sidebarComponents}
            />
        );
    }

    const updateSubscription = desktopUIController.componentRegistered$.subscribe(render);
    render();

    return toDisposable(() => {
        root.unmount();
        updateSubscription.unsubscribe();
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    // FIXME: the element is not append to the DOM tree. So it won't be rendered.
    return element;
}
