import React, { useState, useEffect } from 'react';
import axios from 'axios'
import {PayPalButton} from 'react-paypal-button-v2'
import {Link} from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {getOrderDetails, payOrder, deliverOrder} from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants';
const OrderScreen = ({match, history}) => {
    const orderId = match.params.id
    const[sdkReady, setSdkReady] = useState(false)

    const dispatch = useDispatch()

    const orderDetails = useSelector(state=>state.orderDetails)
    const {order, loading, error} = orderDetails
    
    const userLogin = useSelector(state=>state.userLogin)
    const {userInfo} = userLogin
    
    const orderPay = useSelector(state=>state.orderPay)
    const { loading: loadingPay, success: successPay} = orderPay
    
    const orderDeliver = useSelector(state=>state.orderDeliver)
    const { loading: loadingDeliver, success: successDeliver} = orderDeliver


    if(!loading){
        const addDecimals = (num)=>{
        return (Math.round(num*100)/100).toFixed(2)
    }

    order.itemsPrice = addDecimals(order.orderItems.reduce((acc, item)=>
        acc + item.price* item.qty, 0
    ))
    }

    useEffect(() => {
        if(!userInfo){
            history.push('/login')
        }
    const addPayPalScript = async() => {
        const { data: clientId } = await axios.get('/api/config/paypal')
        const script = document.createElement('script')
        script.type='text/javascript'
        script.async = true
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=INR`
        script.onload = () => {
            setSdkReady(true)
        }

        document.body.appendChild(script)
    }

    // if(!order || order._id !== orderId) {
    //     dispatch(getOrderDetails(orderId))
    // }
    if(!order || successPay||successDeliver){
        dispatch({type: ORDER_PAY_RESET})
        dispatch({type: ORDER_DELIVER_RESET})
        dispatch(getOrderDetails(orderId))
    }else if(!order.isPaid){
        if(!window.paypal){
            addPayPalScript()
        }else {
            setSdkReady(true)
        }
    }
}, [order, orderId, successPay,successDeliver, history, userInfo, dispatch]) 

    const successPaymentHandler = (paymentResult)=>{
        console.log(paymentResult)
        dispatch(payOrder(orderId, paymentResult))
    }

    const successDeliveryHandler = ()=>{
        dispatch(deliverOrder(order))
    }
    
    return (
    loading ? <Loader/> : error ? <Message variant='danger'>{error}</Message>: <>
        <h2>Order {order._id}</h2>
        <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong> {order.user.name}</p>
    <p><strong>Email: </strong><a href={`mailto: ${order.user.email}`}>{order.user.email}</a></p>
                            <p>
                                <strong>
                                    Address :      
                                </strong> 
                                {order.shippingAddress.address},{order.shippingAddress.city},
                                {order.shippingAddress.postalCode},{order.shippingAddress.country} 
                            </p>
                            {order.isDelivered? <Message variant='success'>Delivered On {order.deliveredAt.substr(0,10)}</Message>: <Message variant='danger'>Not Delivered</Message>}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Payment Method : </h2>
                                <p>
                                <strong>
                                    Method : 
                                </strong>
                                {order.paymentMethod}
                                </p>
    {order.isPaid? <Message variant='success'>Paid On {order.paidAt.substr(0,10)}</Message>: <Message variant='danger'>Not Paid</Message>}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Order Items : </h2>
                            
                                
                                {order.orderItems.length === 0 ? <Message>Order is Empty</Message>:<ListGroup variant='flush'>
                                        {order.orderItems.map((item, index)=>(
                                            <ListGroup.Item key={index}>
                                                <Row>
                                                    <Col md={1}>
                                                        <Image src={item.image} alt = {item.name} fluid rounded />
                                                    </Col>
                                                    <Col>
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                    </Col>
                                                    <Col md={4}>
                                                        {item.qty} x <span>&#8377;</span> {item.price} = <span>&#8377;</span> {(item.qty * item.price).toFixed(2)}
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>}
                            
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col>
                    <Card>
                        <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h2>Order Summary</h2>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col><span>&#8377;</span> {order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col><span>&#8377;</span> {order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col><span>&#8377;</span> {order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Total</Col>
                                        <Col><span>&#8377;</span> {order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                {!order.isPaid && (
                                    <ListGroup.Item>
                                        {loadingPay && <Loader/>}
                                        {!sdkReady ? <Loader/>: (
                                            <PayPalButton  currency='INR' amount={order.totalPrice} onSuccess={successPaymentHandler}/>
                                        )}
                                    </ListGroup.Item>
                                )}
                                {loadingDeliver && <Loader />}
                                {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                    <ListGroup.Item>
                                        <Button type='button' className='btn btn-block' onClick={successDeliveryHandler}>
                                            Mark As Delivered
                                        </Button>
                                    </ListGroup.Item>
                                )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
    </>
    )
}

export default OrderScreen
