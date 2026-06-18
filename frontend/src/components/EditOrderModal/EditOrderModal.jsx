import { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../context/storeContextObject';
import { editOrderAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import './EditOrderModal.css';

const EditOrderModal = ({ order, onClose, onSuccess }) => {
    const { food_list } = useContext(StoreContext);
    const [editItems, setEditItems] = useState({});
    const [loading, setLoading] = useState(false);

    // Initialize editItems with the current order items
    useEffect(() => {
        const initialItems = {};
        order.items.forEach(item => {
            // item.food might be an object if populated, or a string ID
            const foodId = typeof item.food === 'object' ? item.food._id : item.food;
            initialItems[foodId] = item.quantity;
        });
        setEditItems(initialItems);
    }, [order]);

    const handleAdd = (foodId) => {
        setEditItems(prev => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
    };

    const handleRemove = (foodId) => {
        setEditItems(prev => {
            const current = prev[foodId] || 0;
            if (current <= 1) {
                const newItems = { ...prev };
                delete newItems[foodId];
                return newItems;
            }
            return { ...prev, [foodId]: current - 1 };
        });
    };

    const handleSave = async () => {
        const itemsArray = Object.keys(editItems).map(foodId => ({
            foodId,
            quantity: editItems[foodId]
        }));

        if (itemsArray.length === 0) {
            toast.error("Order must have at least one item.");
            return;
        }

        setLoading(true);
        try {
            await editOrderAPI(order._id, itemsArray);
            toast.success("Order updated successfully!");
            onSuccess();
        } catch (error) {
            toast.error(error.message || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic subtotal
    const currentSubtotal = Object.keys(editItems).reduce((total, foodId) => {
        const food = food_list.find(f => f._id === foodId);
        if (food) {
            return total + (food.discountPrice || food.price) * editItems[foodId];
        }
        return total;
    }, 0);

    return (
        <div className="edit-modal-overlay">
            <div className="edit-modal">
                <div className="edit-modal-header">
                    <h2>Edit Order <span>#{order._id.substring(0, 8)}</span></h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                
                <p className="edit-modal-warning">You can only add items from the same restaurant.</p>

                <div className="edit-modal-list">
                    {food_list.map(food => {
                        const quantity = editItems[food._id] || 0;
                        // Only show if it's from the same restaurant (assuming all demo items are same for now)
                        // If we had strict multiple restaurants, we'd filter here.
                        return (
                            <div key={food._id} className="edit-food-item">
                                <img src={food.image} alt={food.name} className="edit-food-img" />
                                <div className="edit-food-info">
                                    <p>{food.name}</p>
                                    <span>${food.discountPrice || food.price}</span>
                                </div>
                                <div className="edit-food-actions">
                                    {quantity === 0 ? (
                                        <button onClick={() => handleAdd(food._id)} className="edit-add-btn">Add</button>
                                    ) : (
                                        <div className="edit-counter">
                                            <img onClick={() => handleRemove(food._id)} src={assets.remove_icon_red} alt="Remove" />
                                            <p>{quantity}</p>
                                            <img onClick={() => handleAdd(food._id)} src={assets.add_icon_green} alt="Add" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="edit-modal-footer">
                    <div>
                        <p>New Subtotal: <b>${currentSubtotal.toFixed(2)}</b></p>
                        <small>Tax & Delivery will be recalculated</small>
                    </div>
                    <button onClick={handleSave} disabled={loading} className="edit-save-btn">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOrderModal;
