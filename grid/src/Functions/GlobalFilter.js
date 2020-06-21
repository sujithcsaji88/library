import React, { memo, useState } from "react";
import { useAsyncDebounce } from "react-table";

const GlobalFilter = memo(({ globalFilter, setGlobalFilter }) => {
    const [value, setValue] = useState(globalFilter);

    const onChange = useAsyncDebounce((value) => {
        setGlobalFilter(value || undefined);
    }, 200);

    return (
        <div className="txt-wrap">
            <input
                type="text"
                value={value || ""}
                onChange={(e) => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                className="txt"
                placeholder="Search"
            />
            <i className="fa fa-search fa-6" aria-hidden="true"></i>
        </div>
    );
});

export default GlobalFilter;
