import React, { forwardRef, useRef, useEffect, useState, memo } from "react";

const RowSelector = memo(
    forwardRef(({ indeterminate, ...rest }, ref) => {
        const [checkValue, setCheckValue] = useState(indeterminate);
        const defaultRef = useRef();
        const resolvedRef = ref || defaultRef;
        const onChange = () => {
            setCheckValue(!indeterminate);
        };
        useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
        }, [resolvedRef, indeterminate]);
        return (
            <div className="check-wrap">
                <input type="checkbox" checked={checkValue} onChange={onChange} ref={resolvedRef} {...rest} />
            </div>
        );
    })
);

export default RowSelector;
