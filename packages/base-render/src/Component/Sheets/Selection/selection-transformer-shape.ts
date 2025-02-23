import { TinyColor } from '@ctrl/tinycolor';
import { IRangeWithCoord, ISelectionCellWithCoord, Nullable, RANGE_TYPE } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

import { DEFAULT_SELECTION_LAYER_INDEX } from '../../../Basics/Const';
import {
    ISelectionStyle,
    ISelectionWidgetConfig,
    ISelectionWithCoordAndStyle,
    NORMAL_SELECTION_PLUGIN_STYLE,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
} from '../../../Basics/Selection';
import { Group } from '../../../Group';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { SelectionTransformerModel } from './selection-transformer-model';

enum SELECTION_MANAGER_KEY {
    Selection = '__SpreadsheetSelectionShape__',
    top = '__SpreadsheetSelectionTopControl__',
    bottom = '__SpreadsheetSelectionBottomControl__',
    left = '__SpreadsheetSelectionShapeLeftControl__',
    right = '__SpreadsheetSelectionShapeRightControl__',
    backgroundTop = '__SpreadsheetSelectionBackgroundControlTop__',
    backgroundMiddleLeft = '__SpreadsheetSelectionBackgroundControlMiddleLeft__',
    backgroundMiddleRight = '__SpreadsheetSelectionBackgroundControlMiddleRight__',
    backgroundBottom = '__SpreadsheetSelectionBackgroundControlBottom__',
    fill = '__SpreadsheetSelectionFillControl__',
    lineMain = '__SpreadsheetDragLineMainControl__',
    lineContent = '__SpreadsheetDragLineContentControl__',
    line = '__SpreadsheetDragLineControl__',

    rowHeaderBackground = '__SpreadSheetSelectionRowHeaderBackground__',
    rowHeaderBorder = '__SpreadSheetSelectionRowHeaderBorder__',
    rowHeaderGroup = '__SpreadSheetSelectionRowHeaderGroup__',
    columnHeaderBackground = '__SpreadSheetSelectionColumnHeaderBackground__',
    columnHeaderBorder = '__SpreadSheetSelectionColumnHeaderBorder__',
    columnHeaderGroup = '__SpreadSheetSelectionColumnHeaderGroup__',

    topLeftWidget = '__SpreadSheetSelectionTopLeftWidget__',
    topCenterWidget = '__SpreadSheetSelectionTopCenterWidget__',
    topRightWidget = '__SpreadSheetSelectionTopRightWidget__',
    middleLeftWidget = '__SpreadSheetSelectionMiddleLeftWidget__',
    middleRightWidget = '__SpreadSheetSelectionMiddleRightWidget__',
    bottomLeftWidget = '__SpreadSheetSelectionBottomLeftWidget__',
    bottomCenterWidget = '__SpreadSheetSelectionBottomCenterWidget__',
    bottomRightWidget = '__SpreadSheetSelectionBottomRightWidget__',
}

const SELECTION_TITLE_HIGHLIGHT_ALPHA = 0.3;

/**
 * The main selection canvas component
 */
export class SelectionTransformerShape {
    private _leftControl!: Rect;

    private _rightControl!: Rect;

    private _topControl!: Rect;

    private _bottomControl!: Rect;

    private _backgroundControlTop!: Rect;

    private _backgroundControlBottom!: Rect;

    private _backgroundControlMiddleLeft!: Rect;

    private _backgroundControlMiddleRight!: Rect;

    private _fillControl!: Rect;

    private _selectionShape!: Group;

    private _rowHeaderBackground!: Rect;

    private _rowHeaderBorder!: Rect;

    private _rowHeaderGroup!: Group;

    private _rowHeaderHighlight!: Rect;

    private _columnHeaderBackground!: Rect;

    private _columnHeaderBorder!: Rect;

    private _columnHeaderGroup!: Group;

    private _columnHeaderHighlight!: Rect;

    private _topLeftWidget!: Rect;

    private _topCenterWidget!: Rect;

    private _topRightWidget!: Rect;

    private _middleLeftWidget!: Rect;

    private _middleRightWidget!: Rect;

    private _bottomLeftWidget!: Rect;

    private _bottomCenterWidget!: Rect;

    private _bottomRightWidget!: Rect;

    private _selectionModel!: SelectionTransformerModel;

    private _selectionStyle: Nullable<ISelectionStyle>;

    private _rowHeaderWidth: number = 0;

    private _columnHeaderHeight: number = 0;

    private _widgetRects: Rect[] = [];

    private _dispose$ = new BehaviorSubject<SelectionTransformerShape>(this);

    readonly dispose$ = this._dispose$.asObservable();

    readonly selectionMoving$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    readonly selectionMoved$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    readonly selectionScaling$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    readonly selectionScaled$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    readonly selectionFilling$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    readonly selectionFilled$ = new BehaviorSubject<Nullable<IRangeWithCoord>>(null);

    constructor(
        private _scene: Scene,
        private _zIndex: number,
        private _isHeaderHighlight: boolean = true
    ) {
        this._initialize();
    }

    get zIndex() {
        return this._zIndex;
    }

    get leftControl() {
        return this._leftControl;
    }

    get rightControl() {
        return this._rightControl;
    }

    get topControl() {
        return this._topControl;
    }

    get bottomControl() {
        return this._bottomControl;
    }

    get fillControl() {
        return this._fillControl;
    }

    get backgroundControlTop() {
        return this._backgroundControlTop;
    }

    get backgroundControlBottom() {
        return this._backgroundControlBottom;
    }

    get backgroundControlMiddleLeft() {
        return this._backgroundControlMiddleLeft;
    }

    get backgroundControlMiddleRight() {
        return this._backgroundControlMiddleRight;
    }

    get selectionShape() {
        return this._selectionShape;
    }

    get model() {
        return this._selectionModel;
    }

    get topLeftWidget() {
        return this._topLeftWidget;
    }

    get topCenterWidget() {
        return this._topCenterWidget;
    }

    get topRightWidget() {
        return this._topRightWidget;
    }

    get middleLeftWidget() {
        return this._middleLeftWidget;
    }

    get middleRightWidget() {
        return this._middleRightWidget;
    }

    get bottomLeftWidget() {
        return this._bottomLeftWidget;
    }

    get bottomCenterWidget() {
        return this._bottomCenterWidget;
    }

    get bottomRightWidget() {
        return this._bottomRightWidget;
    }

    get selectionStyle() {
        return this._selectionStyle;
    }

    static create(scene: Scene, zIndex: number, isHeaderHighlight: boolean) {
        return new this(scene, zIndex, isHeaderHighlight);
    }

    static fromJson(
        scene: Scene,
        zIndex: number,
        newSelectionData: ISelectionWithCoordAndStyle,
        rowHeaderWidth: number,
        columnHeaderHeight: number,
        isHeaderHighlight: boolean
    ) {
        const { rangeWithCoord, primaryWithCoord, style } = newSelectionData;
        const control = SelectionTransformerShape.create(scene, zIndex, isHeaderHighlight);
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
        return control;
    }

    enableHeaderHighlight() {
        this._isHeaderHighlight = true;
    }

    disableHeaderHighlight() {
        this._isHeaderHighlight = false;
    }

    /**
     * just handle the view
     *
     * inner update
     */
    _updateControl(style: Nullable<ISelectionStyle>, rowHeaderWidth: number, columnHeaderHeight: number) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const {
            stroke = NORMAL_SELECTION_PLUGIN_STYLE.stroke!,
            widgets = NORMAL_SELECTION_PLUGIN_STYLE.widgets!,
            hasAutoFill = NORMAL_SELECTION_PLUGIN_STYLE.hasAutoFill!,

            AutofillStroke = NORMAL_SELECTION_PLUGIN_STYLE.AutofillStroke!,
        } = style;

        let {
            strokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.strokeWidth!,
            AutofillSize = NORMAL_SELECTION_PLUGIN_STYLE.AutofillSize!,
            AutofillStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.AutofillStrokeWidth!,
        } = style;

        const scale = this._getScale();

        strokeWidth /= scale;
        AutofillSize /= scale;
        AutofillStrokeWidth /= scale;

        const leftAdjustWidth = strokeWidth + SELECTION_CONTROL_BORDER_BUFFER_WIDTH;

        this.leftControl.transformByState({
            height: endY - startY,
            left: -leftAdjustWidth / 2,
            width: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
            top: -SELECTION_CONTROL_BORDER_BUFFER_WIDTH / 2,
        });

        this.leftControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.rightControl.transformByState({
            height: endY - startY,
            left: endX - startX - leftAdjustWidth / 2,
            width: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
            top: -SELECTION_CONTROL_BORDER_BUFFER_WIDTH / 2,
        });

        this.rightControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.topControl.transformByState({
            width: endX - startX + strokeWidth,
            top: -leftAdjustWidth / 2,
            left: -leftAdjustWidth / 2,
            height: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
        });

        this.topControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.bottomControl.transformByState({
            width: endX - startX + strokeWidth,
            top: endY - startY - leftAdjustWidth / 2,
            height: strokeWidth,
            left: -leftAdjustWidth / 2,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
        });

        this.bottomControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        if (hasAutoFill === true && !this._hasWidgets(widgets)) {
            this.fillControl.setProps({
                fill: stroke,
                stroke: AutofillStroke,
            });
            this.fillControl.transformByState({
                width: AutofillSize - AutofillStrokeWidth,
                height: AutofillSize - AutofillStrokeWidth,
                left: endX - startX - AutofillSize / 2,
                top: endY - startY - AutofillSize / 2,
                strokeWidth: AutofillStrokeWidth,
            });
            this.fillControl.show();
        } else {
            this.fillControl.hide();
        }

        this._updateBackgroundControl(style);

        this._updateBackgroundTitle(style, rowHeaderWidth, columnHeaderHeight);

        this._updateWidgets(style);

        this.selectionShape.show();
        this.selectionShape.translate(startX, startY);

        this._selectionStyle = style;

        this._rowHeaderWidth = rowHeaderWidth || 0;

        this._columnHeaderHeight = columnHeaderHeight || 0;

        this.selectionShape.makeDirtyNoDebounce(true);
    }

    update(
        newSelectionRange: IRangeWithCoord,
        rowHeaderWidth: number,
        columnHeaderHeight: number,
        style: Nullable<ISelectionStyle> = NORMAL_SELECTION_PLUGIN_STYLE,
        highlight: Nullable<ISelectionCellWithCoord>
    ) {
        this._selectionModel.setValue(newSelectionRange, highlight);
        if (style == null) {
            style = this._selectionStyle;
        }
        this._updateControl(style, rowHeaderWidth, columnHeaderHeight);
    }

    clearHighlight() {
        this._selectionModel.clearCurrentCell();
        this._updateControl(this._selectionStyle, this._rowHeaderWidth, this._columnHeaderHeight);
    }

    getScene() {
        return this._scene;
    }

    dispose() {
        this._leftControl?.dispose();
        this._rightControl?.dispose();
        this._topControl?.dispose();
        this._bottomControl?.dispose();
        this._backgroundControlTop?.dispose();
        this._backgroundControlMiddleLeft?.dispose();
        this._backgroundControlMiddleRight?.dispose();
        this._backgroundControlBottom?.dispose();
        this._fillControl?.dispose();
        this._selectionShape?.dispose();

        this._rowHeaderBackground?.dispose();

        this._rowHeaderBorder?.dispose();

        this._rowHeaderGroup?.dispose();

        this._rowHeaderBackground?.dispose();

        this._columnHeaderBackground?.dispose();

        this._columnHeaderBorder?.dispose();

        this._columnHeaderGroup?.dispose();

        this._topLeftWidget?.dispose();

        this._topCenterWidget?.dispose();

        this._topRightWidget?.dispose();

        this._middleLeftWidget?.dispose();

        this._middleRightWidget?.dispose();

        this._bottomLeftWidget?.dispose();

        this._bottomCenterWidget?.dispose();

        this._bottomRightWidget?.dispose();

        this._dispose$.next(this);

        this._dispose$.complete();
    }

    /**
     * Get the cell information of the current selection, considering the case of merging cells
     */
    getCurrentCellInfo(): Nullable<IRangeWithCoord> {
        const currentCell = this.model.currentCell;

        if (currentCell) {
            let currentRangeData: IRangeWithCoord;

            if (currentCell.isMerged) {
                const mergeInfo = currentCell.mergeInfo;

                currentRangeData = {
                    startRow: mergeInfo.startRow,
                    endRow: mergeInfo.endRow,
                    startColumn: mergeInfo.startColumn,
                    endColumn: mergeInfo.endColumn,
                    startX: mergeInfo.startX,
                    endX: mergeInfo.endX,
                    startY: mergeInfo.startY,
                    endY: mergeInfo.endY,
                };
            } else {
                const { actualRow, actualColumn, startX, endX, startY, endY } = currentCell;
                currentRangeData = {
                    startRow: actualRow,
                    endRow: actualRow,
                    startColumn: actualColumn,
                    endColumn: actualColumn,
                    startX,
                    endX,
                    startY,
                    endY,
                };
            }

            return currentRangeData;
        }
    }

    getValue(): ISelectionWithCoordAndStyle {
        return {
            ...this._selectionModel.getValue(),
            style: this._selectionStyle,
        };
    }

    private _initialize() {
        this._selectionModel = new SelectionTransformerModel();
        const zIndex = this._zIndex;
        this._leftControl = new Rect(SELECTION_MANAGER_KEY.left + zIndex, {
            zIndex,
        });

        this._rightControl = new Rect(SELECTION_MANAGER_KEY.right + zIndex, {
            zIndex,
        });

        this._topControl = new Rect(SELECTION_MANAGER_KEY.top + zIndex, {
            zIndex,
        });

        this._bottomControl = new Rect(SELECTION_MANAGER_KEY.bottom + zIndex, {
            zIndex,
        });

        this._backgroundControlTop = new Rect(SELECTION_MANAGER_KEY.backgroundTop + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._backgroundControlBottom = new Rect(SELECTION_MANAGER_KEY.backgroundBottom + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._backgroundControlMiddleLeft = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleLeft + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });
        this._backgroundControlMiddleRight = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleRight + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._fillControl = new Rect(SELECTION_MANAGER_KEY.fill + zIndex, {
            zIndex: zIndex + 1,
        });

        const shapes = [
            this._fillControl,
            this._leftControl,
            this._rightControl,
            this._topControl,
            this._bottomControl,
            this._backgroundControlTop,
            this._backgroundControlMiddleLeft,
            this._backgroundControlMiddleRight,
            this._backgroundControlBottom,
        ];

        this._widgetRects = this._initialWidget();

        this._selectionShape = new Group(SELECTION_MANAGER_KEY.Selection + zIndex, ...shapes, ...this._widgetRects);

        this._selectionShape.hide();

        this._selectionShape.evented = false;

        this._selectionShape.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObject(this._selectionShape);

        this._initialTitle();
    }

    private _initialTitle() {
        const zIndex = this._zIndex;
        this._rowHeaderBackground = new Rect(SELECTION_MANAGER_KEY.rowHeaderBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowHeaderBorder = new Rect(SELECTION_MANAGER_KEY.rowHeaderBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowHeaderGroup = new Group(
            SELECTION_MANAGER_KEY.rowHeaderGroup + zIndex,
            this._rowHeaderBackground,
            this._rowHeaderBorder
        );

        this._rowHeaderGroup.hide();

        this._rowHeaderGroup.evented = false;

        this._rowHeaderGroup.zIndex = zIndex;

        this._columnHeaderBackground = new Rect(SELECTION_MANAGER_KEY.columnHeaderBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnHeaderBorder = new Rect(SELECTION_MANAGER_KEY.columnHeaderBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnHeaderGroup = new Group(
            SELECTION_MANAGER_KEY.columnHeaderGroup + zIndex,
            this._columnHeaderBackground,
            this._columnHeaderBorder
        );

        this._columnHeaderGroup.hide();

        this._columnHeaderGroup.evented = false;

        this._columnHeaderGroup.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObjects([this._rowHeaderGroup, this._columnHeaderGroup], DEFAULT_SELECTION_LAYER_INDEX);
    }

    private _initialWidget() {
        const zIndex = this._zIndex;
        this._topLeftWidget = new Rect(SELECTION_MANAGER_KEY.topLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._topCenterWidget = new Rect(SELECTION_MANAGER_KEY.topCenterWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._topRightWidget = new Rect(SELECTION_MANAGER_KEY.topRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._middleLeftWidget = new Rect(SELECTION_MANAGER_KEY.middleLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._middleRightWidget = new Rect(SELECTION_MANAGER_KEY.middleRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomLeftWidget = new Rect(SELECTION_MANAGER_KEY.bottomLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomCenterWidget = new Rect(SELECTION_MANAGER_KEY.bottomCenterWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomRightWidget = new Rect(SELECTION_MANAGER_KEY.bottomRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        return [
            this._topLeftWidget,
            this._topCenterWidget,
            this._topRightWidget,
            this._middleLeftWidget,
            this._middleRightWidget,
            this._bottomLeftWidget,
            this._bottomCenterWidget,
            this._bottomRightWidget,
        ];
    }

    private _updateBackgroundTitle(
        style: Nullable<ISelectionStyle>,
        rowHeaderWidth: number,
        columnHeaderHeight: number
    ) {
        const { startX, startY, endX, endY, rangeType } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const scale = this._getScale();

        const {
            stroke,
            hasRowHeader,
            rowHeaderFill = NORMAL_SELECTION_PLUGIN_STYLE.rowHeaderFill!,
            rowHeaderStroke = NORMAL_SELECTION_PLUGIN_STYLE.rowHeaderStroke!,

            hasColumnHeader,
            columnHeaderFill = NORMAL_SELECTION_PLUGIN_STYLE.columnHeaderFill!,
            columnHeaderStroke = NORMAL_SELECTION_PLUGIN_STYLE.columnHeaderStroke!,
        } = style;

        let {
            rowHeaderStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.rowHeaderStrokeWidth!,

            columnHeaderStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.columnHeaderStrokeWidth!,
        } = style;

        rowHeaderStrokeWidth /= scale;

        columnHeaderStrokeWidth /= scale;

        if (hasColumnHeader === true) {
            let highlightTitleColor = columnHeaderFill;
            if (this._isHeaderHighlight && rangeType === RANGE_TYPE.COLUMN) {
                highlightTitleColor = new TinyColor(stroke).setAlpha(SELECTION_TITLE_HIGHLIGHT_ALPHA).toString();
            }
            this._columnHeaderBackground.setProps({
                fill: highlightTitleColor,
            });
            this._columnHeaderBackground.resize(endX - startX, columnHeaderHeight);

            this._columnHeaderBorder.setProps({
                fill: columnHeaderStroke,
            });
            this._columnHeaderBorder.transformByState({
                width: endX - startX,
                height: columnHeaderStrokeWidth,
                top: columnHeaderHeight - columnHeaderStrokeWidth,
            });

            this._columnHeaderGroup.show();
            this._columnHeaderGroup.translate(startX, 0);
        } else {
            this._columnHeaderGroup.hide();
        }

        this._columnHeaderGroup.makeDirty(true);

        if (hasRowHeader === true) {
            let highlightTitleColor = rowHeaderFill;
            if (this._isHeaderHighlight && rangeType === RANGE_TYPE.ROW) {
                highlightTitleColor = new TinyColor(stroke).setAlpha(SELECTION_TITLE_HIGHLIGHT_ALPHA).toString();
            }
            this._rowHeaderBackground.setProps({
                fill: highlightTitleColor,
            });
            this._rowHeaderBackground.resize(rowHeaderWidth, endY - startY);

            this._rowHeaderBorder.setProps({
                fill: rowHeaderStroke,
            });
            this._rowHeaderBorder.transformByState({
                width: rowHeaderStrokeWidth,
                height: endY - startY,
                left: rowHeaderWidth - rowHeaderStrokeWidth,
            });

            this._rowHeaderGroup.show();
            this._rowHeaderGroup.translate(0, startY);
        } else {
            this._rowHeaderGroup.hide();
        }

        this._rowHeaderGroup.makeDirty(true);
    }

    private _updateBackgroundControl(style: Nullable<ISelectionStyle>) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const scale = this._getScale();

        const { fill = NORMAL_SELECTION_PLUGIN_STYLE.fill! } = style;

        let { strokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.strokeWidth! } = style;

        strokeWidth /= scale;

        const highlightSelection = this._selectionModel.highlightToSelection();

        if (!highlightSelection) {
            this._backgroundControlTop.resize(endX - startX, endY - startY);
            this._backgroundControlTop.setProps({ fill });
            this._backgroundControlBottom.resize(0, 0);
            this._backgroundControlMiddleLeft.resize(0, 0);
            this._backgroundControlMiddleRight.resize(0, 0);
            return;
        }

        const { startX: h_startX, startY: h_startY, endX: h_endX, endY: h_endY } = highlightSelection;

        const strokeOffset = strokeWidth / 2;

        const topConfig = {
            left: -strokeOffset,
            top: -strokeOffset,
            width: endX - startX + strokeOffset * 2,
            height: h_startY - startY + strokeOffset,
        };
        if (topConfig.height < 0) {
            topConfig.width = 0;
            topConfig.height = 0;
        }
        this._backgroundControlTop.transformByState(topConfig);

        const middleLeftConfig = {
            left: -strokeOffset,
            top: h_startY - startY,
            width: h_startX - startX + strokeOffset,
            height: h_endY - h_startY,
        };
        if (middleLeftConfig.width < 0) {
            middleLeftConfig.width = 0;
            middleLeftConfig.height = 0;
        }
        this._backgroundControlMiddleLeft.transformByState(middleLeftConfig);

        const middleRightConfig = {
            left: h_endX - startX - strokeOffset,
            top: h_startY - startY,
            width: endX - h_endX + strokeOffset * 2,
            height: h_endY - h_startY,
        };
        if (middleRightConfig.width < 0) {
            middleRightConfig.width = 0;
            middleRightConfig.height = 0;
        }
        this._backgroundControlMiddleRight.transformByState(middleRightConfig);

        const middleBottomConfig = {
            left: -strokeOffset,
            top: h_endY - startY,
            width: endX - startX + strokeOffset * 2,
            height: endY - h_endY + strokeOffset,
        };
        if (middleBottomConfig.height < 0) {
            middleBottomConfig.width = 0;
            middleBottomConfig.height = 0;
        }
        this._backgroundControlBottom.transformByState(middleBottomConfig);

        this._backgroundControlTop.setProps({ fill });
        this._backgroundControlMiddleLeft.setProps({ fill });
        this._backgroundControlMiddleRight.setProps({ fill });
        this._backgroundControlBottom.setProps({ fill });
    }

    private _updateWidgets(style: Nullable<ISelectionStyle>) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const {
            stroke = NORMAL_SELECTION_PLUGIN_STYLE.stroke!,
            widgets = NORMAL_SELECTION_PLUGIN_STYLE.widgets!,
            widgetStroke = NORMAL_SELECTION_PLUGIN_STYLE.widgetStroke!,
        } = style;

        const scale = this._getScale();

        let {
            widgetSize = NORMAL_SELECTION_PLUGIN_STYLE.widgetSize!,
            widgetStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.widgetStrokeWidth!,
        } = style;

        widgetSize /= scale;

        widgetStrokeWidth /= scale;

        const position = {
            left: -widgetSize / 2,
            center: (endX - startX) / 2 - widgetSize / 2,
            right: endX - startX - widgetSize / 2,
            top: -widgetSize / 2,
            middle: (endY - startY) / 2 - widgetSize / 2,
            bottom: endY - startY - widgetSize / 2,
        };

        const size = widgetSize - widgetStrokeWidth;

        this._widgetRects.forEach((widget) => {
            widget.setProps({
                fill: stroke,
                stroke: widgetStroke,
            });
        });

        if (widgets.tl === true) {
            this._topLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topLeftWidget.show();
        } else {
            this._topLeftWidget.hide();
        }

        if (widgets.tc === true) {
            this._topCenterWidget.transformByState({
                height: size,
                width: size,
                left: position.center,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topCenterWidget.show();
        } else {
            this._topCenterWidget.hide();
        }

        if (widgets.tr === true) {
            this._topRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topRightWidget.show();
        } else {
            this._topRightWidget.hide();
        }

        if (widgets.ml === true) {
            this._middleLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.middle,
                strokeWidth: widgetStrokeWidth,
            });

            this._middleLeftWidget.show();
        } else {
            this._middleLeftWidget.hide();
        }

        if (widgets.mr === true) {
            this._middleRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.middle,
                strokeWidth: widgetStrokeWidth,
            });

            this._middleRightWidget.show();
        } else {
            this._middleRightWidget.hide();
        }

        if (widgets.bl === true) {
            this._bottomLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomLeftWidget.show();
        } else {
            this._bottomLeftWidget.hide();
        }

        if (widgets.bc === true) {
            this._bottomCenterWidget.transformByState({
                height: size,
                width: size,
                left: position.center,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomCenterWidget.show();
        } else {
            this._bottomCenterWidget.hide();
        }

        if (widgets.br === true) {
            this._bottomRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomRightWidget.show();
        } else {
            this._bottomRightWidget.hide();
        }
    }

    private _hasWidgets(widgets: ISelectionWidgetConfig) {
        if (widgets == null) {
            return false;
        }

        const keys = Object.keys(widgets);

        if (keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (widgets[key as keyof ISelectionWidgetConfig] === true) {
                return true;
            }
        }

        return true;
    }

    private _getScale() {
        const { scaleX, scaleY } = this._scene.getAncestorScale();
        return Math.max(scaleX, scaleY);
    }
}
