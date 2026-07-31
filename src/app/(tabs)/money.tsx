import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { Plus, Minus, Settings, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Spacing, Typography, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { FinancialTransaction } from '@/db/schema';
import {
  getTransactions, getTodayExpenses, getDailyLimit, setDailyLimit, addTransaction
} from '@/db/repositories/finance-repository';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { useFocusEffect } from 'expo-router';

export default function MoneyScreen() {
  const { colors } = useThemeContext();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [dailyLimit, setDailyLimitValue] = useState(50000);
  
  const [showTransactionSheet, setShowTransactionSheet] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  
  const [showLimitSheet, setShowLimitSheet] = useState(false);
  const [limitInput, setLimitInput] = useState('');

  const loadData = useCallback(async () => {
    const [tx, expenses, limit] = await Promise.all([
      getTransactions(),
      getTodayExpenses(),
      getDailyLimit(),
    ]);
    setTransactions(tx);
    setTodayExpenses(expenses);
    setDailyLimitValue(limit);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAddTransaction = async () => {
    const amount = parseInt(amountInput.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;
    
    await addTransaction(transactionType, amount, 'General', noteInput.trim());
    setAmountInput('');
    setNoteInput('');
    setShowTransactionSheet(false);
    loadData();
  };

  const handleSetLimit = async () => {
    const limit = parseInt(limitInput.replace(/\D/g, ''), 10);
    if (isNaN(limit) || limit <= 0) return;
    
    await setDailyLimit(limit);
    setLimitInput('');
    setShowLimitSheet(false);
    loadData();
  };

  const budgetRatio = dailyLimit > 0 ? todayExpenses / dailyLimit : 0;
  const hpPercentage = Math.max(0, 100 - (budgetRatio * 100));
  
  let hpColor = colors.success;
  if (budgetRatio > 0.9) hpColor = colors.danger;
  else if (budgetRatio > 0.7) hpColor = colors.yellow;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Wallet</Text>
        <TouchableOpacity onPress={() => { setLimitInput(dailyLimit.toString()); setShowLimitSheet(true); }}>
          <Settings color={colors.textSecondary} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.budgetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.budgetHeader}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Today's Remaining Budget</Text>
          <Wallet color={colors.textSecondary} size={20} />
        </View>
        <Text style={[styles.budgetText, { color: colors.textPrimary }]}>
          Rp {Math.max(0, dailyLimit - todayExpenses).toLocaleString()}
        </Text>
        
        <View style={[styles.hpBarTrack, { backgroundColor: colors.borderHigh }]}>
          <View style={[styles.hpBarFill, { width: `${hpPercentage}%`, backgroundColor: hpColor }]} />
        </View>
        <View style={styles.budgetMeta}>
          <Text style={[styles.budgetMetaText, { color: colors.textMuted }]}>
            Spent: Rp {todayExpenses.toLocaleString()}
          </Text>
          <Text style={[styles.budgetMetaText, { color: colors.textMuted }]}>
            Limit: Rp {dailyLimit.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.danger + '22', borderColor: colors.danger }]}
          onPress={() => { setTransactionType('expense'); setShowTransactionSheet(true); }}
        >
          <ArrowDownRight color={colors.danger} size={20} />
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success + '22', borderColor: colors.success }]}
          onPress={() => { setTransactionType('income'); setShowTransactionSheet(true); }}
        >
          <ArrowUpRight color={colors.success} size={20} />
          <Text style={[styles.actionBtnText, { color: colors.success }]}>Income</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: FinancialTransaction }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? colors.success : colors.danger;
    const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
    
    const date = new Date(item.created_at);
    
    return (
      <View style={[styles.transactionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.txIconBox, { backgroundColor: amountColor + '22' }]}>
          <Icon color={amountColor} size={20} />
        </View>
        <View style={styles.txBody}>
          <Text style={[styles.txNote, { color: colors.textPrimary }]}>
            {item.note || (isIncome ? 'Income' : 'Expense')}
          </Text>
          <Text style={[styles.txDate, { color: colors.textMuted }]}>
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.txAmount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}Rp {item.amount.toLocaleString()}
        </Text>
      </View>
    );
  };

  const handleAmountChange = (text: string) => {
    const numericVal = text.replace(/\D/g, '');
    if (!numericVal) {
      setAmountInput('');
      return;
    }
    setAmountInput(parseInt(numericVal, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  };

  const handleLimitChange = (text: string) => {
    const numericVal = text.replace(/\D/g, '');
    if (!numericVal) {
      setLimitInput('');
      return;
    }
    setLimitInput(parseInt(numericVal, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Transaction Sheet */}
      <BottomSheet visible={showTransactionSheet} onClose={() => setShowTransactionSheet(false)} title={`Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}>
        <InputField
          placeholder="Amount (Rp)"
          value={amountInput}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          autoFocus
        />
        <InputField
          placeholder="Note (optional)"
          value={noteInput}
          onChangeText={setNoteInput}
        />
        <Button 
          title="Save" 
          onPress={handleAddTransaction} 
          size="lg" 
          disabled={!amountInput.trim()} 
          style={{ backgroundColor: transactionType === 'income' ? colors.success : colors.danger }} 
        />
      </BottomSheet>

      {/* Limit Sheet */}
      <BottomSheet visible={showLimitSheet} onClose={() => setShowLimitSheet(false)} title="Set Daily Budget">
        <InputField
          placeholder="Daily Limit (Rp)"
          value={limitInput}
          onChangeText={handleLimitChange}
          keyboardType="numeric"
          autoFocus
        />
        <Button title="Save Limit" onPress={handleSetLimit} size="lg" disabled={!limitInput.trim()} />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  headerContainer: { marginBottom: Spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  pageTitle: { ...Typography.displayMedium },
  budgetCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  budgetLabel: { ...Typography.bodySmall, textTransform: 'uppercase', letterSpacing: 1 },
  budgetText: { ...Typography.displayLarge, marginBottom: Spacing.lg },
  hpBarTrack: { height: 12, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  hpBarFill: { height: '100%', borderRadius: Radius.full },
  budgetMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetMetaText: { ...Typography.caption },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  actionBtnText: { ...Typography.titleMedium },
  sectionTitle: { ...Typography.titleMedium, marginBottom: Spacing.md },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  txIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  txBody: { flex: 1 },
  txNote: { ...Typography.body, marginBottom: 2 },
  txDate: { ...Typography.caption },
  txAmount: { ...Typography.titleMedium },
});
