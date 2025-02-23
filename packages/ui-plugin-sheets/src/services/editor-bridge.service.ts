import { DeviceInputEventType, IDocumentLayoutObject } from '@univerjs/base-render';
import { KeyCode } from '@univerjs/base-ui';
import { IPosition, Nullable } from '@univerjs/core';
import { createIdentifier, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IEditorBridgeServiceVisibleParam {
    visible: boolean;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
}

export interface IEditorBridgeServiceParam {
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
    position: IPosition;
    canvasOffset: { left: number; top: number };
    documentLayoutObject: IDocumentLayoutObject;
}

export interface IEditorBridgeService {
    state$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    dispose(): void;
    setState(param: IEditorBridgeServiceParam): void;
    getState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    show(openType: DeviceInputEventType): void;
    hide(): void;
    isVisible(): IEditorBridgeServiceVisibleParam;
}

export class EditorBridgeService implements IEditorBridgeService, IDisposable {
    private _state: Nullable<IEditorBridgeServiceParam> = null;

    private _visible: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
    };

    private readonly _state$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly state$ = this._state$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();

    dispose(): void {
        this._state$.complete();
        this._state = null;
    }

    setState(param: IEditorBridgeServiceParam) {
        this._state = param;

        this._state$.next(param);
    }

    getState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return this._state;
    }

    show(eventType = DeviceInputEventType.Dblclick) {
        this._visible = {
            visible: true,
            eventType,
        };

        this._visible$.next(this._visible);
    }

    hide() {
        this._visible = {
            visible: false,
            eventType: this._visible.eventType,
        };

        this._visible$.next(this._visible);
    }

    isVisible() {
        return this._visible;
    }
}

export const IEditorBridgeService = createIdentifier<EditorBridgeService>('univer.sheet-editor-bridge.service');
