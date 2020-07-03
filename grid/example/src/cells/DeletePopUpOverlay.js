import React, { memo } from 'react'

const divStyle = {
    backgroundColor: "#ccc",
    height: "200px",
    width: "400px",
    marginLeft: "-850px",
}


const DeletePopUpOverLay = memo((props) => {
    const{ closePopUp,deleteRowFromGrid, row } = props;

    const handleDeleteRow=(indexToBeDeleted)=>{
        deleteRowFromGrid(indexToBeDeleted);
    }
    
    const handleClosePopUp=()=>{
        closePopUp();
    }
    return (
        <div className="main-div-delete-overlay" style={divStyle}>
            <div className="cancel-save-buttons-delete">
                <button className="delete-Button" onClick={()=>handleDeleteRow(row.index)}>Delete</button>
                    &nbsp;&nbsp;&nbsp;
            <button className="cancel-Button" onClick={handleClosePopUp}>Cancel</button>
            </div>
        </div>

    )
})

export default DeletePopUpOverLay