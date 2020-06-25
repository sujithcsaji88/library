import React, { useMemo, memo, useState } from "react";
import Grid from "grid";
import { getData, getFullDataCount } from "./getData";
import RowOptions from "./cells/RowOptions";
import SREdit from "./cells/SREdit";
import FlightEdit from "./cells/FlightEdit";
import SegmentEdit from "./cells/SegmentEdit";

const App = memo(() => {
    //Number of records to be pulled from single API
    const recordsCount = 300;
    //Set state value for variable to check if there is anext page available
    const [hasNextPage, setHasNextPage] = useState(true);
    //Set state value for variable to check if the loading process is going on
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    //Set state value for variable to hold initial data
    const [items, setItems] = useState(getData(0, recordsCount));

    //Check if device is desktop
    const isDesktop = window.innerWidth > 1024;

    //Get grid height value, which is a required value
    const gridHeight = "80vh";

    //Create an array of airports
    const airportCodeList = useMemo(
        () => [
            "AAA",
            "AAB",
            "AAC",
            "ABA",
            "ABB",
            "ABC",
            "ACA",
            "ACB",
            "ACC",
            "BAA",
            "BAB",
            "BAC",
            "BBA",
            "BBB",
            "BBC",
            "BCA",
            "BCB",
            "BCC",
            "CAA",
            "CAB",
            "CAC",
            "CBA",
            "CBB",
            "CBC",
            "CCA",
            "CCB",
            "CCC",
            "XXX",
            "XXY",
            "XXZ",
            "XYX",
            "XYY",
            "XYZ",
            "XZX",
            "XZY",
            "XZZ",
            "YXX",
            "YXY",
            "YXZ",
            "YYX",
            "YYY",
            "YYZ",
            "YZX",
            "YZY",
            "YZZ",
            "ZXX",
            "ZXY",
            "ZXZ",
            "ZYX",
            "ZYY",
            "ZYZ",
            "ZZX",
            "ZZY",
            "ZZZ"
        ],
        []
    );

    //Configure columns and its related functions
    let columns = useMemo(
        () => [
            {
                Header: "Id",
                accessor: "travelId",
                disableFilters: true,
                width: 50
            },
            {
                Header: "Flight",
                accessor: "flight",
                width: 100,
                Cell: FlightEdit,
                sortType: (rowA, rowB) => {
                    return rowA.original.flight.flightno > rowB.original.flight.flightno ? -1 : 1;
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { flightno, date } = rowValue;
                        return flightno.toLowerCase().includes(filterText) || date.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                Header: "Segment",
                accessor: "segment",
                width: 100,
                disableSortBy: true,
                Cell: (row) => (
                    <SegmentEdit
                        airportCodeList={airportCodeList}
                        index={row.row.index}
                        id="segment"
                        updateCellData={updateCellData}
                        value={row.value}
                    />
                ),
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { from, to } = rowValue;
                        return from.toLowerCase().includes(filterText) || to.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                Header: "Details",
                accessor: "details",
                width: 300,
                disableSortBy: true,
                Cell: (row) => {
                    const { startTime, endTime, status, additionalStatus, flightModel, bodyType, type, timeStatus } = row.value;
                    let timeStatusArray = timeStatus.split(" ");
                    const timeValue = timeStatusArray.shift();
                    const timeText = timeStatusArray.join(" ");
                    return (
                        <div className="details-wrap content">
                            <ul>
                                <li>
                                    {startTime} – {endTime}
                                </li>
                                <li className="divider">|</li>
                                <li>
                                    <span>{status}</span>
                                </li>
                                <li className="divider">|</li>
                                <li>{additionalStatus}</li>
                                <li className="divider">|</li>
                                <li>{flightModel}</li>
                                <li className="divider">|</li>
                                <li>{bodyType}</li>
                                <li className="divider">|</li>
                                <li>
                                    <span>{type}</span>
                                </li>
                                <li className="divider">|</li>
                                <li>
                                    <strong>{timeValue} </strong>
                                    <span>{timeText}</span>
                                </li>
                            </ul>
                        </div>
                    );
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const {
                            flightModel,
                            bodyType,
                            type,
                            startTime,
                            endTime,
                            status,
                            additionalStatus,
                            timeStatus
                        } = rowValue;
                        return (
                            String(flightModel).toLowerCase().includes(filterText) ||
                            bodyType.toLowerCase().includes(filterText) ||
                            type.toLowerCase().includes(filterText) ||
                            startTime.toLowerCase().includes(filterText) ||
                            endTime.toLowerCase().includes(filterText) ||
                            status.toLowerCase().includes(filterText) ||
                            additionalStatus.toLowerCase().includes(filterText) ||
                            timeStatus.toLowerCase().includes(filterText)
                        );
                    });
                }
            },
            {
                Header: "Weight",
                accessor: "weight",
                width: 130,
                Cell: (row) => {
                    const { percentage, value } = row.value;
                    return (
                        <div className="weight-details content">
                            <strong className="per">{percentage}</strong>
                            <span>
                                <strong>{value.split("/")[0]}/</strong>
                                {value.split("/")[1]}
                            </span>
                        </div>
                    );
                },
                sortType: (rowA, rowB) => {
                    return rowA.original.weight.percentage > rowB.original.weight.percentage ? -1 : 1;
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { percentage, value } = rowValue;
                        return percentage.toLowerCase().includes(filterText) || value.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                Header: "Volume",
                accessor: "volume",
                width: 100,
                Cell: (row) => {
                    const { percentage, value } = row.value;
                    return (
                        <div className="weight-details content">
                            <strong className="per">{percentage}</strong>
                            <span>
                                <strong>{value.split("/")[0]}/</strong>
                                {value.split("/")[1]}
                            </span>
                        </div>
                    );
                },
                sortType: (rowA, rowB) => {
                    return rowA.original.volume.percentage > rowB.original.volume.percentage ? -1 : 1;
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { percentage, value } = rowValue;
                        return percentage.toLowerCase().includes(filterText) || value.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                Header: "ULD Positions",
                accessor: "uldPositions",
                disableSortBy: true,
                width: 100,
                Cell: (row) => (
                    <div className="uld-details content">
                        <ul>
                            {row.value.map((positions, index) => {
                                return (
                                    <li key={index}>
                                        <span>{positions.position}</span>
                                        <strong>{positions.value}</strong>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ),
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        return (
                            rowValue.findIndex((item) => {
                                return (item.position + " " + item.value).toLowerCase().includes(filterText);
                            }) >= 0
                        );
                    });
                }
            },
            {
                Header: "Revenue/Yield",
                accessor: "revenue",
                width: 120,
                Cell: (row) => {
                    const { revenue, yeild } = row.value;
                    return (
                        <div className="revenue-details content">
                            <span className="large">{revenue}</span>
                            <span>{yeild}</span>
                        </div>
                    );
                },
                sortType: (rowA, rowB) => {
                    return rowA.original.revenue.revenue > rowB.original.revenue.revenue ? -1 : 1;
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { revenue, yeild } = rowValue;
                        return revenue.toLowerCase().includes(filterText) || yeild.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                Header: "SR",
                accessor: "sr",
                width: 90,
                Cell: SREdit
            },
            {
                Header: "Queued Booking",
                accessor: "queuedBooking",
                width: 130,
                disableSortBy: true,
                Cell: (row) => {
                    const { sr, volume } = row.value;
                    return (
                        <div className="queued-details content">
                            <span>
                                <strong></strong>
                                {sr}
                            </span>
                            <span>
                                <strong></strong> {volume}
                            </span>
                        </div>
                    );
                },
                filter: (rows, id, filterValue) => {
                    const filterText = filterValue ? filterValue.toLowerCase() : "";
                    return rows.filter((row) => {
                        const rowValue = row.values[id];
                        const { sr, volume } = rowValue;
                        return sr.toLowerCase().includes(filterText) || volume.toLowerCase().includes(filterText);
                    });
                }
            },
            {
                id: "custom",
                disableResizing: true,
                disableFilters: true,
                disableSortBy: true,
                width: 50,
                Cell: ({ row }) => {
                    return (
                        <div className="action">
                            <RowOptions row={row} selectRowOptions={selectRowOptions} />
                            <span className="expander" {...row.getToggleRowExpandedProps()}>
                                {row.isExpanded ? (
                                    <i className="fa fa-angle-up" aria-hidden="true"></i>
                                ) : (
                                    <i className="fa fa-angle-down" aria-hidden="true"></i>
                                )}
                            </span>
                        </div>
                    );
                }
            }
        ],
        [airportCodeList]
    );

    if (!isDesktop) {
        columns = columns.filter((item) => {
            return item.accessor !== "details";
        });
    }

    //Return data that has to be shown in the row expanded region
    const renderExpandedContent = (row) => {
        const { remarks, details } = row.original;
        if (isDesktop) {
            return remarks;
        } else {
            const { startTime, endTime, status, additionalStatus, flightModel, bodyType, type, timeStatus } = details;
            let timeStatusArray = timeStatus.split(" ");
            const timeValue = timeStatusArray.shift();
            const timeText = timeStatusArray.join(" ");
            return (
                <div className="details-wrap content">
                    <ul>
                        <li>{remarks}</li>
                        <li className="divider">|</li>
                    </ul>
                    <ul>
                        <li>
                            {startTime} – {endTime}
                        </li>
                        <li className="divider">|</li>
                        <li>
                            <span>{status}</span>
                        </li>
                        <li className="divider">|</li>
                        <li>{additionalStatus}</li>
                        <li className="divider">|</li>
                        <li>{flightModel}</li>
                        <li className="divider">|</li>
                        <li>{bodyType}</li>
                        <li className="divider">|</li>
                        <li>
                            <span>{type}</span>
                        </li>
                        <li className="divider">|</li>
                        <li>
                            <strong>{timeValue} </strong>
                            <span>{timeText}</span>
                        </li>
                    </ul>
                </div>
            );
        }
    };

    //Add logic for doing global search in the grid
    const globalSearchLogic = (rows, columns, filterValue) => {
        if (filterValue) {
            const searchText = filterValue.toLowerCase();
            return rows.filter((row) => {
                const { flight, segment, details, weight, volume, revenue, queuedBooking, uldPositions, sr } = row.original;
                const { date, flightno } = flight;
                const { from, to } = segment;
                const { flightModel, bodyType, type, startTime, endTime, status, additionalStatus, timeStatus } = details;
                return (
                    date.toLowerCase().includes(searchText) ||
                    flightno.toLowerCase().includes(searchText) ||
                    from.toLowerCase().includes(searchText) ||
                    to.toLowerCase().includes(searchText) ||
                    flightModel.toString().toLowerCase().includes(searchText) ||
                    bodyType.toLowerCase().includes(searchText) ||
                    type.toLowerCase().includes(searchText) ||
                    startTime.toLowerCase().includes(searchText) ||
                    endTime.toLowerCase().includes(searchText) ||
                    status.toLowerCase().includes(searchText) ||
                    additionalStatus.toLowerCase().includes(searchText) ||
                    timeStatus.toLowerCase().includes(searchText) ||
                    weight.percentage.toLowerCase().includes(searchText) ||
                    weight.value.toLowerCase().includes(searchText) ||
                    volume.percentage.toLowerCase().includes(searchText) ||
                    volume.value.toLowerCase().includes(searchText) ||
                    revenue.revenue.toLowerCase().includes(searchText) ||
                    revenue.yeild.toLowerCase().includes(searchText) ||
                    sr.toLowerCase().includes(searchText) ||
                    queuedBooking.sr.toLowerCase().includes(searchText) ||
                    queuedBooking.volume.toLowerCase().includes(searchText) ||
                    uldPositions.findIndex((item) => {
                        return (item.position + " " + item.value).toLowerCase().includes(searchText);
                    }) >= 0
                );
            });
        }
        return rows;
    };

    //Add logic to calculate height of each row, based on the content of  or more columns
    const calculateRowHeight = (rows, index, headerCells) => {
        let rowHeight = 50;
        if (headerCells && headerCells.length && rows && rows.length && index >= 0) {
            const { headers } = headerCells[0];
            const { original, isExpanded } = rows[index];
            headers.forEach((header) => {
                const { id, totalFlexWidth } = header;
                if (id === "details") {
                    const details = original.details;
                    if (details) {
                        const text =
                            details.additionalStatus +
                            details.bodyType +
                            details.endTime +
                            details.flightModel +
                            details.startTime +
                            details.status +
                            details.timeStatus +
                            details.type;
                        rowHeight = rowHeight + Math.ceil((65 * text.length) / totalFlexWidth);
                        if (totalFlexWidth > 300) {
                            rowHeight = rowHeight + 0.001 * (totalFlexWidth - 300);
                        }
                        if (totalFlexWidth < 300) {
                            rowHeight = rowHeight + (300 - totalFlexWidth) / 4;
                        }
                    }
                }
            });
            if (isExpanded) {
                rowHeight = rowHeight + (isDesktop ? 30 : 80);
            }
        }
        return rowHeight;
    };

    //Gets called when there is a cell edit
    const updateCellData = (rowIndex, columnId, value) => {
        console.log(rowIndex + " " + columnId + " " + JSON.stringify(value));
    };

    //Gets called when Row option is selected
    const selectRowOptions = (row) => {
        console.log(row);
    };

    //Gets called when row bulk edit is done
    const selectBulkData = (selectedRows) => {
        console.log(selectedRows);
    };

    //Gets called when page scroll reaches the bottom of the grid
    //Fetch the next set of data and append it to the variable holding grid date and update the state value
    const loadNextPage = (...args) => {
        const totalRecordsCount = getFullDataCount();
        const newIndex = args && args.length ? args[0] : -1;
        if (newIndex >= 0 && newIndex < totalRecordsCount) {
            setIsNextPageLoading(true);
            setTimeout(() => {
                setHasNextPage(items.length <= totalRecordsCount);
                setIsNextPageLoading(false);
                setItems(items.concat(getData(newIndex, newIndex + recordsCount)));
            }, 100);
        }
    };

    return (
        <div>
            <Grid
                title="AWBs"
                gridHeight={gridHeight}
                columns={columns}
                data={items}
                globalSearchLogic={globalSearchLogic}
                updateCellData={updateCellData}
                selectBulkData={selectBulkData}
                calculateRowHeight={calculateRowHeight}
                renderExpandedContent={renderExpandedContent}
                hasNextPage={hasNextPage}
                isNextPageLoading={isNextPageLoading}
                loadNextPage={loadNextPage}
            />
            {isNextPageLoading ? <h2 style={{ textAlign: "center" }}>Loading...</h2> : null}
        </div>
    );
});

export default App;
