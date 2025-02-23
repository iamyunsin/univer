import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { IOverGridImagePluginConfig, IOverGridImageProperty, OVER_GRID_IMAGE_PLUGIN_NAME } from './Basics';
import { CellImageController, OverGridImageController } from './Controller';
import { UploadService } from './services/upload.service';
import { IImagePluginData } from './Symbol';
import { OverImageRender } from './View/Render';

/**
 * TODO: 考虑加入单元格图片的情况，
 *
 * 如果工具栏的“插入单元格图片”“插入浮动图片”是在一个按钮的下拉列表里，那么UI部分是重叠的，所以这里应该叫 ImagePlugin，下面再细分 OverGridImage 和 CellImage
 *
 */
export class ImagePlugin extends Plugin {
    static override type = PluginType.Sheet;

    protected _overGridImageController: OverGridImageController | null = null;

    protected _overImageRender: OverImageRender | null = null;

    protected _imagePluginData: Map<string, IOverGridImageProperty>;

    protected _cellImageController: CellImageController | null = null;

    constructor(
        private _config: IOverGridImagePluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(OVER_GRID_IMAGE_PLUGIN_NAME);
        this._imagePluginData = new Map<string, IOverGridImageProperty>();
        this._injector.add([IImagePluginData, { useFactory: () => this._imagePluginData }]);
    }

    override onRendered(): void {
        this._initializeDependencies(this._injector);
    }

    private _initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [
            [OverGridImageController],
            [CellImageController],
            [OverImageRender],
            [UploadService],
        ];
        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
        this._overImageRender = sheetInjector.createInstance(OverImageRender);
        this._cellImageController = sheetInjector.createInstance(CellImageController);
        this._overGridImageController = sheetInjector.createInstance(OverGridImageController);
    }
}
