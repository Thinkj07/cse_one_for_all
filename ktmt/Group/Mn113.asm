#Chuong trinh: BTL KienTruc
	.include "macro.mac"
#Data segment
	.data
# Cac dinh nghia bien  
filename: .asciiz "INT10.BIN"   	# Ten file dau vao
buffer:   .align 2              		# Can chinh bo nho
          .space 40            		# Bo nho 40 byte (10 so nguyen)
fdescr:   .word 0              		# File descriptor

# Cac cau nhac nhap/xuat du lieu 

str_tc:	.asciiz "Doc file thanh cong.\n"
str_loi:.asciiz "Mo file bi loi.\n"

endl: 	.asciiz "\n"
space: 	.asciiz " "
twodot: .asciiz ":"
begin: 	.asciiz "Mang ban dau : "
message:.asciiz "Selection Sort: "
step: 	.asciiz "Step "
complete: .asciiz "Chuong trinh chay thanh cong"
	.text
main:		
# Mo file (syscall 13)
    	la $a0, filename          # Dat ten file
    	li $a1, 0                 # che do rean-only (0: read-only)
    	li $v0, 13                # syscall: open
    	syscall
    	bgez $v0, read_data       # Neu mo thang cong, tiep tuc
    	la $a0, str_loi           # Neu that bai, in thong bao loi
    	li $v0, 4
    	syscall
    	j Kthuc

read_data:
    	move $t0, $v0             # Luu file descriptor vao $t0
    	sw $t0, fdescr

    # Doc 40 byte dau tien (10 so nguyen)
    	li $v0, 14                # syscall:read
    	move $a0, $t0             # File descriptor
    	la $a1, buffer            # luu vo buffer
    	li $a2, 40                # Doc 40 byte (10 so nguyen)
    	syscall
# dong file 
    	lw $a0,fdescr 
    	addi $v0,$zero,16 
    	syscall 
# Xu ly 
	li $s0, 0 		# Index cua con tro curr
	li $s1, 10		# So phan tu cua mang
# In mot so thong bao va mang ban dau
	la $a0, begin		
	li $v0, 4
	syscall

	la $a0, buffer
	jal PrintArr
	
	la $a0, endl
	li $v0, 4
	syscall
	
	la $a0, message
	li $v0, 4
	syscall
	
	la $a0, endl
	li $v0, 4
	syscall
	
#Bat dau thuc hien Sort
main_while:
	slt $s3, $s0, $s1
	beq $s3, $zero, end_main_while	# Dieu kien dung
	
	la $a0, buffer
	li $s2, 0
	jal SelSort			# $s2 = 1 neu mang thay doi
	beq $s2, $zero, main_while	# Neu khong doi thi 
					# thuc hien lai vong lap
#In mot so thong bao va mang da thay doi
	la $a0, step
	li $v0, 4
	syscall
	
	add $a0, $s0, 0
	li $v0, 1
	syscall
	
	la $a0, twodot
	li $v0, 4
	syscall
 	
	la $a0, space
	li $v0, 4
	syscall
	
	la $a0, buffer
	jal PrintArr
	
	la $a0, endl
	li $v0, 4
	syscall
	
	j main_while
end_main_while:
	la $a0, endl
	li $v0, 4
	syscall 
	
	la $a0, complete
	li $v0, 4
	syscall 

#ket thuc chuong trinh (syscall)
Kthuc:	addi	$v0,$zero,10
	syscall
# -------------------------------	
# Selection Sort
# Input : $a0 chua dia chi mang
#	  $s0 chua index tai vi tri current da sap xep
#	  $s1 chua so phan tu cua mang	
# Output: $a0 mang dia chi mang sau khi thuc hien 1 buoc SelectionSort
#	  $s0 chua vi tri index + 1 so voi input
#	  $s2 = 1 neu mang co thay doi
SelSort:		
# $t0 : chua index tai vi tri smallest
# $t1 : chua index tai vi tri walker / current
# $t2 : bool ket thuc while / con tro den smallest
# $t3 : con tro den walker / con tro den current
	add $t0, $s0, $zero		# smallest = curr
	addi $t1, $s0, 1			# walker = curr + 1
	
while1:	slt $t2, $t1, $s1		
	beq $t2, $zero, end_while1	# walker > size thi break
	
	sll $t2, $t0, 2			
	add $t2, $a0, $t2		
	lw $t2, 0($t2)			# $t2 chua gia tri tai smallest
	
	sll $t3, $t1, 2
	add $t3, $a0, $t3
	lw $t3, 0($t3)			# $t3 chua gia tri tai walker
	
	slt $t2, $t3, $t2
	beq $t2, $zero, update		# $t3 > $t2 thi walker tiep tuc chay
	add $t0, $t1, $zero		# $t3 < $t2 thi cap nhap smallest
	li $s2, 1			# $s2 = 1 --> mang co thay doi
update:
	addi $t1, $t1, 1
	j while1
end_while1: 
	beq $s2, $zero, end_func		# $s2 = 0 ---> mang ko thay doi
	sll $t0, $t0, 2
	add $t0, $a0, $t0
	lw $t2, 0($t0)
	
	add $t1, $s0, $zero
	sll $t1, $t1, 2
	add $t1, $a0, $t1
	lw $t3, 0($t1)
	
	sw $t2, 0($t1)			# Thay doi gia tri curr va smallest
	sw $t3, 0($t0)
end_func:
	addi $s0, $s0, 1 	
	jr $ra
#--------------
# PrintArr
# Input: $a0 chua vi tri arr
#	 $s1 chua so phan tu cua mang
# Output: In ra cac phan tu cua mang
PrintArr:
# $t0 : index cua phan tu hien tai
# $a1 : luu dia chi cua mang de $a0 thuc hien syscall
	li $t0, 0
	add $a1, $a0, $zero		
	lw $a0, 0($a0)
while2:	
	slt $t2, $t0, $s1
	beq $t2, $zero, end_while2	# index >= size thi break
	li $v0, 1
	syscall				# print so nguyen trong $a0
	
	la $a0, space			# print space
	li $v0, 4
	syscall
	
	addi $t0, $t0, 1
	sll $t2, $t0, 2
	add $a0, $a1, $t2		# Tang index va cap nhap vao $a0
	lw $a0, 0($a0)
	j while2
end_while2:	
	jr $ra
# -------------------------------
