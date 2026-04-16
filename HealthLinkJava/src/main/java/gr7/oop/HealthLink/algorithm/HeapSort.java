package gr7.oop.HealthLink.algorithm;

import java.util.List;

/**
 * Giải thuật Heap Sort - Sắp xếp giảm dần.
 * Độ phức tạp: O(n log n)
 * 
 * Heap Sort hoạt động bằng cách:
 * 1. Xây dựng Max-Heap từ mảng đầu vào
 * 2. Lần lượt tách phần tử lớn nhất (gốc) ra cuối mảng
 * 3. Heapify lại phần còn lại
 * 4. Đảo ngược mảng để có thứ tự giảm dần
 *
 * @param <T> Kiểu dữ liệu của phần tử cần sắp xếp
 */
public class HeapSort<T> {

	/**
	 * Interface để trích xuất giá trị so sánh từ đối tượng.
	 */
	@FunctionalInterface
	public interface KeyExtractor<T> {
		int getKey(T item);
	}

	private final KeyExtractor<T> keyExtractor;

	/**
	 * Khởi tạo HeapSort với hàm trích xuất key.
	 * @param keyExtractor hàm lấy giá trị int để so sánh từ đối tượng T
	 */
	public HeapSort(KeyExtractor<T> keyExtractor) {
		this.keyExtractor = keyExtractor;
	}

	/**
	 * Sắp xếp danh sách theo thứ tự GIẢM DẦN bằng Heap Sort.
	 * @param list danh sách cần sắp xếp (sẽ được sắp xếp tại chỗ - in-place)
	 */
	public void sortDescending(List<T> list) {
		int n = list.size();
		if (n <= 1) return;

		// Bước 1: Xây dựng Max-Heap (Build Max-Heap)
		// Bắt đầu từ node cha cuối cùng (n/2 - 1) đến gốc (0)
		for (int i = n / 2 - 1; i >= 0; i--) {
			heapify(list, n, i);
		}

		// Bước 2: Trích xuất từng phần tử từ heap
		// Đưa phần tử lớn nhất (gốc) về cuối, rồi heapify phần còn lại
		for (int i = n - 1; i > 0; i--) {
			// Hoán đổi gốc (phần tử lớn nhất) với phần tử cuối
			swap(list, 0, i);
			// Heapify lại cây con với kích thước giảm đi
			heapify(list, i, 0);
		}

		// Bước 3: Sau Heap Sort, mảng ở thứ tự tăng dần
		// Đảo ngược để có thứ tự giảm dần
		reverse(list);
	}

	/**
	 * Heapify: Đảm bảo tính chất Max-Heap cho cây con có gốc tại index i.
	 * So sánh node cha với 2 node con, đưa giá trị lớn nhất lên gốc.
	 * 
	 * @param list danh sách đang sắp xếp
	 * @param heapSize kích thước heap hiện tại
	 * @param rootIndex vị trí gốc cần heapify
	 */
	private void heapify(List<T> list, int heapSize, int rootIndex) {
		int largest = rootIndex;       // Giả sử gốc là lớn nhất
		int leftChild = 2 * rootIndex + 1;   // Con trái: 2*i + 1
		int rightChild = 2 * rootIndex + 2;  // Con phải: 2*i + 2

		// So sánh con trái với gốc
		if (leftChild < heapSize &&
				keyExtractor.getKey(list.get(leftChild)) > keyExtractor.getKey(list.get(largest))) {
			largest = leftChild;
		}

		// So sánh con phải với phần tử lớn nhất hiện tại
		if (rightChild < heapSize &&
				keyExtractor.getKey(list.get(rightChild)) > keyExtractor.getKey(list.get(largest))) {
			largest = rightChild;
		}

		// Nếu gốc không phải lớn nhất, hoán đổi và tiếp tục heapify
		if (largest != rootIndex) {
			swap(list, rootIndex, largest);
			// Đệ quy heapify cây con bị ảnh hưởng
			heapify(list, heapSize, largest);
		}
	}

	/**
	 * Hoán đổi 2 phần tử trong danh sách.
	 */
	private void swap(List<T> list, int i, int j) {
		T temp = list.get(i);
		list.set(i, list.get(j));
		list.set(j, temp);
	}

	/**
	 * Đảo ngược danh sách.
	 */
	private void reverse(List<T> list) {
		int left = 0, right = list.size() - 1;
		while (left < right) {
			swap(list, left, right);
			left++;
			right--;
		}
	}
}
