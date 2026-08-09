import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Minus, Settings, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { Spacing, Typography, Radius, ClayShadow } from '@/constants/design';
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
  const insets = useSafeAreaInsets();
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
      getDailyLimit()]);
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
  
  let hpColor = colors.mint;
  if (budgetRatio > 0.9) hpColor = colors.coral;
  else if (budgetRatio > 0.7) hpColor = colors.amber;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Wallet</Text>
        <TouchableOpacity
          style={[ClayShadow.soft, { backgroundColor: colors.surface, borderRadius: Radius.sm, padding: 10 }]}
          onPress={() => { setLimitInput(dailyLimit.toString()); setShowLimitSheet(true); }}
        >
          <Settings color={colors.textSecondary} size={22} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.budgetCard, ClayShadow.card]}>
        <View style={styles.budgetHeader}>
          <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Today's Remaining Budget</Text>
          <Wallet color={colors.amber} size={20} />
        </View>
        <Text style={[styles.budgetText, { color: colors.textPrimary }]}>
          Rp {Math.max(0, dailyLimit - todayExpenses).toLocaleString()}
        </Text>
        
        <View style={[styles.hpBarTrack, { backgroundColor: colors.surfaceHigh }]}>
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
          style={[styles.actionBtn, ClayShadow.soft, { backgroundColor: colors.coralSoft }]}
          onPress={() => { setTransactionType('expense'); setShowTransactionSheet(true); }}
        >
          <ArrowDownRight color={colors.coral} size={20} />
          <Text style={[styles.actionBtnText, { color: colors.coral }]}>Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionBtn, ClayShadow.soft, { backgroundColor: colors.mintSoft }]}
          onPress={() => { setTransactionType('income'); setShowTransactionSheet(true); }}
        >
          <ArrowUpRight color={colors.mint} size={20} />
          <Text style={[styles.actionBtnText, { color: colors.mint }]}>Income</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: FinancialTransaction }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? colors.mint : colors.coral;
    const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
    
    const date = new Date(item.created_at);
    
    return (
      <View style={[styles.transactionCard, ClayShadow.soft]}>
        <View style={[styles.txIconBox, { backgroundColor: amountColor + '18' }]}>
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
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 24) + 16 }]}>
      {/* Decorative Header Background */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: Math.max(insets.top, 24) + 120,
        backgroundColor: colors.mintSoft,
        borderBottomLeftRadius: Radius.xl,
        borderBottomRightRadius: Radius.xl,
      }} />
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTransaction}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

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
          variant={transactionType === 'income' ? 'primary' : 'danger'}
        />
      </BottomSheet>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  list: { paddingBottom: 100 },
  headerContainer: { marginBottom: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  pageTitle: { ...Typography.displayMedium },
  budgetCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  budgetLabel: { ...Typography.bodySmall, textTransform: 'uppercase', letterSpacing: 1 },
  budgetText: { ...Typography.displayLarge, marginBottom: Spacing.md },
  hpBarTrack: { height: 8, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.xs },
  hpBarFill: { height: '100%', borderRadius: Radius.full },
  budgetMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetMetaText: { ...Typography.caption },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  actionBtnText: { ...Typography.titleMedium },
  sectionTitle: { ...Typography.titleMedium, marginBottom: Spacing.md },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  txIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  txBody: { flex: 1 },
  txNote: { ...Typography.body, marginBottom: 2 },
  txDate: { ...Typography.caption },
  txAmount: { ...Typography.titleMedium },
});
