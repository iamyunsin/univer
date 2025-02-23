import { Input } from '@univerjs/base-ui';
import { Component, createRef } from 'react';

import styles from './index.module.less';

interface IProps {
    data: any[];
    input?: string;
    onClick: (value: string) => void;
    onChange?: (value: string) => void;
}

interface IState {}

export class FormatContent extends Component<IProps, IState> {
    private _ref = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: IProps) {}

    handleClick(value: string, index: number) {
        const lis = this._ref.current?.querySelectorAll('li');
        if (!lis) return;
        for (let i = 0; i < lis.length; i++) {
            lis[i].classList.remove(styles.formatSelected);
        }

        lis[index].classList.add(styles.formatSelected);

        this.props.onClick(value);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = (e.target as HTMLInputElement).value;
        this.props.onChange?.(value);
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    override render() {
        const { data, input } = this.props;

        return (
            <div className={styles.formatContent} ref={this._ref}>
                input && (
                <div className={styles.formatInput}>
                    <span>{input}:</span>
                    <Input type="number" value="2" onChange={this.handleChange.bind(this)}></Input>
                </div>
                )
                <ul>
                    {data.map((item, index) => (
                        <li onClick={() => this.handleClick(item.value, index)}>
                            <span>{item.label}</span>
                            <span>{item.suffix}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}
