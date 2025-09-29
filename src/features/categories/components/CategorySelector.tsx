import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Category } from '../../../../src/types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategoryId === null && styles.selectedCategoryButton]}
          onPress={() => onSelectCategory(null)}
        >
          <Text style={[styles.buttonText, selectedCategoryId === null && styles.selectedButtonText]}>Todas</Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, selectedCategoryId === category.id && styles.selectedCategoryButton]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text style={[styles.buttonText, selectedCategoryId === category.id && styles.selectedButtonText]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e7ff', // Tailwind: indigo-100
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#c7d2fe', // Tailwind: indigo-200
  },
  selectedCategoryButton: {
    backgroundColor: '#4f46e5', // Tailwind: indigo-600
    borderColor: '#4338ca', // Tailwind: indigo-700
  },
  buttonText: {
    color: '#4f46e5', // Tailwind: indigo-600
    fontWeight: '600',
    fontSize: 14,
  },
  selectedButtonText: {
    color: '#ffffff', // Tailwind: white
  },
});

export default CategorySelector;
