import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '../ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    unit: 'kg',
    image: 'test-image.jpg',
    stock: 10,
    minOrder: 1,
    maxOrder: 100,
    increment: 1,
    discontinued: false
  };

  const defaultProps = {
    product: mockProduct,
    quantity: '',
    error: '',
    onQuantityChange: jest.fn(),
    onAddToCart: jest.fn(),
    showStock: false,
    showEditButton: false,
    showDeleteButton: false,
    editable: false,
    onEditClick: jest.fn(),
    onDeleteClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductCard {...defaultProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99/kg')).toBeInTheDocument();
    expect(screen.getByText('Unidad: kg')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toHaveAttribute('src', 'test-image.jpg');
  });

  it('shows stock information when showStock is true', () => {
    render(<ProductCard {...defaultProps} showStock={true} />);
    
    expect(screen.getByText('Stock: 10')).toBeInTheDocument();
  });

  it('shows discontinued chip when product is discontinued', () => {
    const discontinuedProduct = { ...mockProduct, discontinued: true };
    render(<ProductCard {...defaultProps} product={discontinuedProduct} />);
    
    expect(screen.getByText('Descontinuado')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when showEditButton and showDeleteButton are true', () => {
    render(
      <ProductCard 
        {...defaultProps} 
        showEditButton={true} 
        showDeleteButton={true} 
      />
    );
    
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('handles quantity input when editable is true', () => {
    render(<ProductCard {...defaultProps} editable={true} />);
    
    const quantityInput = screen.getByPlaceholderText('Cantidad (kg)');
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    expect(defaultProps.onQuantityChange).toHaveBeenCalledWith(1, '5');
  });

  it('calls onAddToCart when add button is clicked', () => {
    render(<ProductCard {...defaultProps} editable={true} />);
    
    const addButton = screen.getByText('Agregar');
    fireEvent.click(addButton);
    
    expect(defaultProps.onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onEditClick when edit button is clicked', () => {
    render(<ProductCard {...defaultProps} showEditButton={true} />);
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(defaultProps.onEditClick).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onDeleteClick when delete button is clicked', () => {
    render(<ProductCard {...defaultProps} showDeleteButton={true} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDeleteClick).toHaveBeenCalledWith(mockProduct);
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Invalid quantity';
    render(<ProductCard {...defaultProps} editable={true} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
}); 