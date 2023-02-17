import React, {Component} from "react";
import {bindActionCreators, compose} from "redux";
import {withRouter} from "react-router";
import queryString from 'querystring';
import {connect} from "react-redux";
import get from "lodash/get";
import "./style.scss";
import {
    showToast,
} from "@utils/common";
import { hideFooter, hideHeader } from "@src/action";
import {getInvoicePDF} from "./APIs/actions";
import PropTypes from 'prop-types';
import fileDownload from 'js-file-download';
import { TRANSACTIONSMESSAGES } from './APIs/constants';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invoiceDownload:{},
            baId: null,
            accessToken: null,
            type: 'view',
            invoiceNumber: null,
            pageNum: null,
        };
        this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
    }

    base64toBlob(base64Data, fileName) {
        const sliceSize = 1024;
        let byteCharacters = atob(base64Data);
        let bytesLength = byteCharacters.length;
        let slicesCount = Math.ceil(bytesLength / sliceSize);
        let byteArrays = new Array(slicesCount);
    
        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            let begin = sliceIndex * sliceSize;
            let end = Math.min(begin + sliceSize, bytesLength);
    
            let bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        fileDownload(new Blob(byteArrays, { type: 'application/pdf' }), `${fileName}.pdf`);
        showToast(TRANSACTIONSMESSAGES.INVOICE_DOWNLOADED);
    }
    
    componentDidMount() {
        const { hideHeader, hideFooter } = this.props;
        let data = queryString.parse(location?.search);
        const { accessToken, baId, invoiceNo, type, subscriberId } = data;
        hideHeader(true);
        hideFooter(true);
        this.setState({
            baId: baId,
            accessToken: accessToken,
            invoiceNumber: invoiceNo,
            sId: subscriberId,
            type,
        }, ()=> {
            this.downloadInvoice();
        });
    }

    componentWillUnmount() {
        let {hideHeader, hideFooter} = this.props;
        hideHeader(false);
        hideFooter(false);
    }

    downloadInvoice = () => {
        const { baId, accessToken, invoiceNumber, sId } = this.state;
        if(invoiceNumber) {
            this.props.getInvoicePDF(baId, accessToken, invoiceNumber, sId);
        } else {
            showToast(TRANSACTIONSMESSAGES.NO_INVOICE_DOWNLOADED);
        }
    }

    static getDerivedStateFromProps(nextProps, _prevState) {
        return {
            invoiceDownload: nextProps.invoicePDF !== 'error' ? nextProps.invoicePDF.data : nextProps.invoicePDF,
        };
    }

    shouldComponentUpdate(_, nextState) {
        const { pageNum, invoiceDownload } = this.state;
        if(
            nextState.pageNum !== pageNum ||
            nextState.invoiceDownload !== invoiceDownload
        ) {
            return true;
        }
        return false;
    }

    componentDidUpdate(_, prevState) {
        const { type } = this.state;
        if (prevState.invoiceDownload !== this.state.invoiceDownload) {
            if(this.state.invoiceDownload !== 'error') {
                if(type !== 'view') {
                    this.base64toBlob(this.state.invoiceDownload.paymentInvoice, this.state.invoiceDownload.fileName);
                }
            } else {
                showToast(TRANSACTIONSMESSAGES.INVOICE_DOWNLOADED_ERROR);
            }
            
        }
    }

    utilUint8ArrayfromBase64 = function(stringData) {
        let byteData = window.atob(stringData);
        //console.log("Length::" + byteData.length);
        let r = new Uint8Array(byteData.length);
        for (let i = 0; i < byteData.length; ++i) {
            r[i] = byteData.charCodeAt(i);
        }
        return r;
    }

    onDocumentLoadSuccess(numPages) {
        this.setState({
            pageNum: numPages,
        });
    }

    render() {
        const { type, pageNum } = this.state;
        return (
            <React.Fragment>
                {
                    type === 'view' && this.state.invoiceDownload !== 'error' && this.state.invoiceDownload &&
                    <Document className="pdf-viewer-block" file={{data: this.utilUint8ArrayfromBase64(this.state.invoiceDownload.paymentInvoice)}} onLoadSuccess={({ numPages }) => this.onDocumentLoadSuccess(numPages)}>
                        {Array.from(new Array(pageNum), (_, index) => (
                            <Page key={`page_${index + 1}`} className="pdf-pages" pageNumber={index + 1} />
                        ))}
                    </Document>
                }
                {this.state.invoiceDownload === 'error' && <h3 className='content-header transaction-header'>{TRANSACTIONSMESSAGES.INVOICE_DOWNLOADED_ERROR}</h3> }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    invoicePDF:get(state.transactionReducer, "invoicePDF"),
});

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(
            {
                getInvoicePDF,
                hideHeader,
                hideFooter,
            },
            dispatch,
        ),
    };
}

Transactions.propTypes = {
    getInvoicePDF: PropTypes.func,
    hideHeader: PropTypes.func,
    hideFooter: PropTypes.func,
};

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Transactions);
