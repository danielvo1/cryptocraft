import * as React from 'react';
import { useQuery } from '@apollo/client'

import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Title from './Title';
import Link from '@mui/material/Link';
// import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Auth from '../utils/auth';

import Transaction from './Transaction';
import { useCryptoContext } from '../utils/CryptoContext';
import { GET_CRYPTOINFO, GET_PORTFOLIO, GET_ME } from '../utils/queries';


const columns = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'ticker', label: 'Ticker', minWidth: 100 },
    { id: 'price', label: 'Price\u00a0(USD)', minWidth: 170 },
    { id: 'buysell', label: 'Buy/Sell', minWidth: 100, align: 'right' }
];

// gridType will either be "my" or "all"
export default function CryptoGrid({ gridType }) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [open, setOpen] = React.useState(false);
    const [price, setPrice] = React.useState(0)

    const { currentticker, handletickerchange } = useCryptoContext();
    const { loading, data } = useQuery(GET_CRYPTOINFO);
    const { loading: getme_loading, data: getme_data } = useQuery(GET_ME);
    
    let un; //checks username -> profile username

    if (getme_data) {
        un = getme_data.me.username;
        console.log(un)
    }
    let curCryptos = [];
    // Grabs portfolio data
    const { data: getportfolio_data } = useQuery(GET_PORTFOLIO, {
        variables: { name: un }
    });

    console.log(getportfolio_data)
    if (getportfolio_data) {
        curCryptos = getportfolio_data.getPortfolio.cryptos;
    }

    let map = new Map();
    curCryptos.forEach(element => {
        console.log(element)
        if (map.has(element.ticker)) {
            map.set(element.ticker, map.get(element.ticker) + element.quantity);
        } else {
            map.set(element.ticker, element.quantity);
        }
    });

    const cryptoQuantities = [...map.entries()];

    // work from here

    function getButton(ticker) {
        return (
            <button>Trade</button>
        )
    }
    function createData(name, ticker, price) {
        // TODO add button
        let btn = getButton(ticker);
        // console.log(btn);
        return { name, ticker, price, btn };
    }

    // Grabs portfolio data
    const { data } = useQuery(GET_PORTFOLIO, {
        variables: { name: Auth.getProfile().data.username }
    });
    console.log(data)
    let curCryptos;

    if (data) {
        curCryptos = data.getPortfolio.cryptos;
        console.log(data)
    }

    let map = new Map();
    curCryptos.forEach(element => {
        console.log(element)
        if (map.has(element.ticker)) {
            map.set(element.ticker, map.get(element.ticker) + element.quantity);
        } else {
            map.set(element.ticker, element.quantity);
        }
    });

    const cryptoQuantities = [...map.entries()];
    console.log(cryptoQuantities);

    // default seed data
    var rows = [
        createData('Bitcoin', 'BTC', 44000),
        createData('Ethereum', 'ETH', 4080),
    ];

    if (cryptoInfo_loading) {
        console.log('loading crypto grid...')
    } else {
        let temp = [];


        if (gridType === "all") {
            for (let i = 0; i < data.cryptoData.cryptoInfo.length; i++) {
                temp[i] = data.cryptoData.cryptoInfo[i].slice();

            }
            temp.forEach(element => {
                element.push(getButton(element[1]));
            });
        }
        else {
            temp = [
                ['My Crypto 1', 'BTC', 50000, getButton('btc')],
                ['My Crypto 2', 'ETH', 50000, getButton('eth')]
            ];
        }
        rows = temp;
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const handleOpen = (bool) => setOpen(bool);


    return (
        <React.Fragment>
            <div>
                {open
                    ? <Transaction open={open} handleOpen={handleOpen} action={"buy"} price={price} />
                    : <div></div>
                }
            </div>

            <Title>{gridType === "all" ? "Browse Cryptos" : "My Cryptos"}</Title>

            <Stack spacing={2} sx={{ width: 300 }}>
                <Autocomplete
                    id="search-for-crypto"
                    freeSolo
                    options={rows.map((option) => option[1])}
                    renderInput={(params) => <TextField {...params} label="Search For Crypto" onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const ticker = params.inputProps.value.toLowerCase();
                            handletickerchange(ticker);
                        }
                    }} />}
                />
            </Stack>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="Crypto Table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}
                                            currentticker={currentticker} handletickerchange={handletickerchange} onClick={(event) => {
                                                event.preventDefault();
                                                handletickerchange(row[1]);
                                                // handles what row is being clicked on, saves ticker to render other components, saves to context
                                            }}>
                                            {columns.map((column, index) => {
                                                const value = row[index];
                                                if (index === 3) {
                                                    return (
                                                        <TableCell key={index} align={column.align} onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            handletickerchange(row[1]);
                                                            // console.log(row[1] + " button clicked");
                                                            setPrice(row[2]);
                                                            handleOpen(true);
                                                        }}>
                                                            {column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value}
                                                        </TableCell>
                                                    );
                                                }
                                                return (
                                                    <TableCell key={index} align={column.align}>
                                                        {column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>

                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            <Link color="primary" target="_blank" href="https://coinmarketcap.com/" sx={{ mt: 3 }}>
                See more Cryptos
            </Link>
        </React.Fragment>
    );
}