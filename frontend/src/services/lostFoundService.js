import api from './api';

export const getAllLostFoundItems = (params) => {
    return api.get('/lost-found', { params });
};

export const getLostFoundItemById = (id) => {
    return api.get(`/lost-found/${id}`);
};

export const getMyLostFoundItems = () => {
    return api.get('/lost-found/my');
};

export const reportLostFoundItem = (data) => {
    return api.post('/lost-found', data);
};

export const claimLostFoundItem = (id) => {
    return api.patch(`/lost-found/${id}/claim`);
};

export const closeLostFoundItem = (id, data) => {
    return api.patch(`/lost-found/${id}/close`, data);
};

export const deleteLostFoundItem = (id) => {
    return api.delete(`/lost-found/${id}`);
};
