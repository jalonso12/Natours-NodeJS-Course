import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
    try{
        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
    }catch (err) {
        showAlert('error', err.response.data.message);
    }
};



// SIMPLE HTML POST REQUEST FORM
// export const updateData = async (name, email) => {
//     try{
//         const res = await axios({
//             method: 'PATCH',
//             url: '/api/v1/users/updateMe',
//             data: {
//                 name,
//                 email
//             }
//         });

//         if(res.data.status === 'success') {
//             showAlert('success', 'Data updated successfully');
//         }
//     }catch (err) {
//         showAlert('error', err.response.data.message);
//     }
// };