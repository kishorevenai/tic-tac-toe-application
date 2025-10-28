import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable({
  rows,
  joinFunc,
}: {
  rows: any;
  joinFunc: (roomId: string, count: number) => void;
}) {
  console.log("Rows in Table:", rows);

  const columns = [
    { field: "S.No", headerName: "S.No", width: 90 },
    { field: "match_id", headerName: "Room ID", width: 400 },
    { field: "size", headerName: "Players", width: 130 },
    {
      field: "max",
      headerName: "Max Players",
      type: "number",
      width: 150,
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      sortable: false,
      renderCell: (params: any) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          // startIcon={<AddIcon />}
          onClick={() => joinFunc(params.row.match_id, params.row.size)}
        >
          Join
        </Button>
      ),
    },
  ];

  let alteredTable = rows.map((row: any, index: number) => ({
    id: index + 1,
    "S.No": index + 1,
    match_id: row.match_id,
    size: row.size,
    max: 2,
  }));

  return (
    <Paper sx={{ height: 700, width: "100%" }}>
      <DataGrid
        sx={{
          border: 0,
          fontFamily: '"Bitcount Grid Single", system-ui',
          backgroundColor: "grey",
        }}
        rows={alteredTable}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
      />
    </Paper>
  );
}
