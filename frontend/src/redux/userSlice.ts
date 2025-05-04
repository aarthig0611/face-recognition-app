import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    name: string;
    showForm: boolean;
    unknownDescriptor: Float32Array | null;
    croppedFace: string | null;
}
  
const initialState: UserState = {
    name: '',
    showForm: false,
    unknownDescriptor: null,
    croppedFace: null,
};
  
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setName(state, action: PayloadAction<string>) {
            state.name = action.payload;
        },
        setShowForm(state, action: PayloadAction<boolean>) {
            state.showForm = action.payload;
        },
        setUnknownDescriptor(state, action: PayloadAction<Float32Array | null>) {
            state.unknownDescriptor = action.payload;
        },
        setCroppedFace(state, action: PayloadAction<string | null>) {
            state.croppedFace = action.payload;
        },
        resetForm(state) {
            state.name = '';
            state.unknownDescriptor = null;
            state.croppedFace = null;
            state.showForm = false;
        },
    },
  });
  
export const {
    setName,
    setShowForm,
    setUnknownDescriptor,
    setCroppedFace,
    resetForm,
} = userSlice.actions;
  
export default userSlice.reducer;
