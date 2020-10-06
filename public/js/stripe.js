import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51HZ1YII1nwvEXn5r3Ii6K7dSdberd15yRxJYnWGwSDd1BR8rxIuls8D6wkGSLPNKfOObrPnj97rsweFQJz88FwFb00hP2kyYdU');

export const bookTour = async tourId => {
    try {
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }catch (err){
        showAlert('error', err);
    }
};