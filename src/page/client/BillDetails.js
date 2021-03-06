import React ,{useEffect,useState}from 'react'; 
import { PageHeader,Table,Row,Col,Space,Card ,Button,message,Modal} from 'antd';
import * as FetchAPI from '../../util/fetchApi';
import {getPriceVND} from '../../contain/getPriceVND';
import Spinner from '../../elements/spinner';
import { useSelector } from 'react-redux';
import { useParams,useHistory } from 'react-router-dom';
import ModalReviewProduct from '../../elements/ModalReviewProduct';
export default function BillDetails(){
    const history = useHistory();
    const [dataProduct, setdataProduct] = useState();
    const [dataBill, setdataBill] = useState();
    const [totalTmp, settotalTmp] = useState(0);
    const [showContent, setshowContent] = useState(false);
    const [promotionprice, setpromotionprice] = useState(0);
    const [showModalReview, setshowModalReview] = useState(false);
    const [showModalCancel, setshowModalCancel] = useState(false);
    const [dataSale, setdataSale] = useState();
    const currentUser = useSelector(state=>state.userReducer.currentUser);
    const [statusUser, setstatusUser] = useState(false);
    const {idBill} = useParams();

    useEffect(()=>{
        console.log(idBill)
        setstatusUser(false);
        setshowContent(false)
        getProduct();
        getInforPayment();
    },[currentUser])
    const getProduct = async()=>{
        const data = {"idOrder":idBill}
        const product = await FetchAPI.postDataAPI('/order/getProductByIdBill',data);
        if(product!==undefined){
            let total = 0;
            product.map((e,index)=>{
                total+= e.price*e.quanity;
                if(index===product.length-1){
                    settotalTmp(total);
                }
                return false;
            })
        }
        setdataProduct(product);
    }
    const getInforPayment = async()=>{
        const data = {"idOrder":idBill}
        const bill = await FetchAPI.postDataAPI('/order/getBillById',data);
        if(currentUser.id===undefined){
            setstatusUser(false)
        }else{
            if(currentUser.id===bill[0].idUser){
                setstatusUser(true)
            }
        }
        setdataBill(bill[0])
        if(bill[0].idSale!==null){
            getSale(bill[0].idSale);
        }
        setshowContent(true)
    }
    const getSale = async(idSale)=>{
        const res = await FetchAPI.postDataAPI("/order/getSaleById",{"idSale":idSale})
        if(res!==undefined){
            setdataSale(res[0])
            setpromotionprice(res[0].cost_sale)
        }
    }
    const handleCancelBill = async()=>{
        const data = {"code_order":dataBill.code_order,"status":3,"email":currentUser.email}
        const res = await FetchAPI.postDataAPI("/order/updateStatusBill",data);
        if(res.msg){
            if(res.msg==="Success"){
                setTimeout(()=>{
                    setshowModalCancel(false)
                    message.success("H???y ????n h??ng th??nh c??ng !");
                    history.goBack();
                },500)
            }else{
                setTimeout(()=>{
                    setshowModalCancel(false)
                    message.error("C?? l???i r???i !!");
                 
                },500)
            }
        }
    }
    const ModalCancelBill = ()=>(
        <Modal
            title={`B???n ch???c ch???n mu???n h???y ????n #${dataBill.id}`}
            visible={showModalCancel}
            onOk={handleCancelBill}
            onCancel={()=>setshowModalCancel(false)}
            cancelText="Tho??t"
            okText="Ch???c ch???n"
        >
            <p>B???n ch???c ch???n v???i quy???t ?????nh c???a m??nh ! ????n h??ng n??y c???a b???n s??? b??? h???y.</p>
        </Modal>
    )
    const columns  = [
        {
            title:"S???n ph???m",
            key:'product',
            render : record=>{
                return(
                    <div>
                        <span>{record.name_product+" ( "+record.size +" )"}</span>
                        <span style={{ paddingLeft:20,fontWeight:'bold' }}>{"X" +record.quanity}</span>
                    </div>
                )
            }
        },
        {
            title:"T???ng",
            key:'total_price',
            render: record=>{
                return <span>{getPriceVND(record.price*record.quanity) +" ??"}</span>
            }
        }
    ]
    const ViewProduct = ()=>(
        <Table 
            columns={columns}
            dataSource={dataProduct}
            pagination={false} 
            size="small"
            summary={()=>(
                <Table.Summary>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>T???m t??nh</span></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>{getPriceVND(totalTmp)+" ??"}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    {dataSale !== undefined &&
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>M?? khuy???n m??i</span></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>{"-"+getPriceVND(promotionprice)+" ??"}</Table.Summary.Cell>
                        </Table.Summary.Row>
                    }
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>Ph?? v???n chuy???n</span></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>{getPriceVND(30000)+" ??"}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>T???ng</span></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>{getPriceVND(totalTmp-promotionprice+30000)+" ??"}</Table.Summary.Cell>
                    </Table.Summary.Row>
                    {dataBill.status===2 &&
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><span style={{fontWeight:'bold'}}>????nh gi?? s???n ph???m</span></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                            <Button onClick={()=>setshowModalReview(true)}>
                                ????nh gi?? ngay
                            </Button>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                    }
                </Table.Summary>
        )}
        />      
    )
    const getTextStatus = (a)=>{
        if(a===0){
            return <b>??ang x??? l??</b>
        }else if(a===1){
            return <b>??ang giao h??ng</b>
        }else if(a===2){
            return <b>???? ho??n th??nh</b>
        }else{
            return <b>???? h???y</b>
        }
    }
    return(
        <div style={{ minHeight:450,paddingBottom:20 }}>
            {showContent ?
            <div>
            {statusUser ?
            <div>
                
            <PageHeader
                className="site-page-header"
                onBack={() => history.goBack()}
                title="Chi ti???t ????n h??ng"
                subTitle={"M?? ????n h??ng: #"+dataBill.id}
            />
            <Row>
            <Col lg={14} xs={24} style={{ padding:"20px 40px" }} >
                {ViewProduct()}
                <Card title="?????a ch??? thanh to??n" style={{ marginTop:30 }}>
                <div style={{ fontSize:16 }}>
                <Space direction="vertical" size={20}>
                    <span><b>T??n: </b>{dataBill.name}</span>
                    <span><b>?????a ch???: </b>{dataBill.address}</span>
                    <span><b>Email: </b>{dataBill.email}</span>
                    <span><b>S??? ??i???n tho???i: </b>{dataBill.phone} </span>
                </Space>
                </div>
                </Card>
            </Col>
            <Col lg={10} xs={24} style={{ justifyContent:'center',display:'flex' }}>
                <Card title="C???m ??n b???n. ????n h??ng ???? ???????c nh???n." style={{ marginTop:20,width:'80%' }}>
                <ul>
                    <Space size={10} direction="vertical">
                        <li>M?? ????n h??ng : <b>{"#"+dataBill.id}</b></li>
                        <li>Ng??y ?????t: <b>{new Date(dataBill.create_at).toString()}</b></li>
                        <li>Email : <b>{dataBill.email}</b></li>
                        <li>T???ng c???ng : <b>{getPriceVND(totalTmp-promotionprice)+" ??"}</b></li>
                        <li>Th???i gian c???p nh???t h??a ????n: <b>{new Date(dataBill.update_at).toString()}</b></li>
                        <li>Ph????ng th???c thanh to??n: 
                            <b>{dataBill.methodPayment===1 ? "Chuy???n kho???n ng??n h??ng":"Tr??? ti???n m???t"}</b>
                        </li>
                        <li>
                            T??nh tr???ng : {getTextStatus(dataBill.status)}
                        </li>
                        <div>
                            <Button type="primary" onClick={()=>setshowModalCancel(true)} danger disabled={dataBill.status!==0} >
                                H???y ????n
                            </Button>
                        </div>
                    </Space>
                </ul>
                </Card>
            </Col>
            </Row> 
            <ModalReviewProduct 
                visible={showModalReview}
                onCancel={()=>setshowModalReview(false)}
                refresh={()=>getProduct()}
                dataProduct={dataProduct}
                user={currentUser}
            /> 
            {ModalCancelBill()}
            </div>
            :
            <div style={{ padding:"20px 40px" }}>
                <span style={{ fontWeight:'bold' }}>B???n kh??ng c?? quy???n truy c???p h??a ????n n??y...</span>
            </div>
            }
            </div>
            :
            <Spinner spinning={!showContent}/>
            }
        </div>
    )
}