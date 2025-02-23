import { SetWorksheetNameCommand } from '@univerjs/base-sheets';
import { useObservable } from '@univerjs/base-ui/Components/hooks/observable.js';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';

interface IBaseInputProps {
    sheetId: string | undefined;
    sheetName: string;
}
export const InputEdit: React.FC<IBaseInputProps> = (props) => {
    const sheetbarService = useDependency(ISheetBarService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renameId = useObservable(sheetbarService.renameId$, '');
    const oldValue = props.sheetName;
    const [val, setVal] = useState(props.sheetName || '');
    const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVal(e.target.value);
    };
    const blur = () => {
        submit();
    };

    const submit = () => {
        if (val !== oldValue) {
            const workbookId = univerInstanceService.getCurrentUniverSheetInstance()?.getUnitId();
            commandService.executeCommand(SetWorksheetNameCommand.id, {
                worksheetId: props.sheetId,
                workbookId,
                name: val,
            });
        }

        sheetbarService.setRenameId('');
    };

    const keydown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key !== undefined && ev.key === 'Enter') {
            return submit();
        }
        if (ev.keyCode !== undefined && ev.keyCode === 13) {
            return submit();
        }
    };

    const isRenaming = renameId === props.sheetId;
    return isRenaming ? (
        <input
            type="text"
            draggable={false}
            value={val}
            onMouseDown={(e) => {
                e.stopPropagation();
            }}
            autoFocus
            onChange={changeValue}
            onBlur={blur}
            onKeyDown={keydown}
            onClick={(e) => {
                e.stopPropagation();
            }}
        />
    ) : (
        <span>{props.sheetName}</span>
    );
};
