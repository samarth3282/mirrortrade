"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, TrendingUp, DollarSign, BookOpen, ThermometerSnowflake } from "lucide-react";
import { MOCK_MARKET_CONDITIONS_OPTIONS } from "@/lib/constants";
import React, { useEffect } from "react";

const settingsSchema = z.object({
  userApiKey: z.string().min(1, "User API Key is required."),
  friendApiKey: z.string().min(1, "Friend's API Key is required."),
  tradeSizeLimit: z.coerce.number().positive("Trade size limit must be a positive number."),
  accountBalance: z.coerce.number().positive("Account balance must be a positive number."),
  tradeHistory: z.string().min(1, "Trade history summary is required."),
  marketConditions: z.string().min(1, "Market conditions are required."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsCard() {
  const { toast } = useToast();
  const { 
    userApiKey, friendApiKey, tradeSizeLimit, accountBalance, tradeHistory, marketConditions, 
    updateUserSettings 
  } = useAppStore(state => ({
    userApiKey: state.userApiKey,
    friendApiKey: state.friendApiKey,
    tradeSizeLimit: state.tradeSizeLimit,
    accountBalance: state.accountBalance,
    tradeHistory: state.tradeHistory,
    marketConditions: state.marketConditions,
    updateUserSettings: state.updateUserSettings,
  }));

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      userApiKey,
      friendApiKey,
      tradeSizeLimit,
      accountBalance,
      tradeHistory,
      marketConditions,
    },
  });

  useEffect(() => {
    form.reset({
      userApiKey,
      friendApiKey,
      tradeSizeLimit,
      accountBalance,
      tradeHistory,
      marketConditions,
    });
  }, [userApiKey, friendApiKey, tradeSizeLimit, accountBalance, tradeHistory, marketConditions, form]);


  function onSubmit(data: SettingsFormValues) {
    updateUserSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your MirrorTrade settings have been updated.",
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
          Configuration Settings
        </CardTitle>
        <CardDescription>Manage your API keys and trading preferences for MirrorTrade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="userApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><KeyRound size={16}/> Your Sharekhan API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your API key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="friendApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><KeyRound size={16}/> Friend's Sharekhan API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter friend's API key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tradeSizeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><TrendingUp size={16}/> Max Investment per Trade ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1000" {...field} />
                  </FormControl>
                  <FormDescription>Set the maximum amount to invest in a single replicated trade.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><DollarSign size={16}/> Current Account Balance ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} />
                  </FormControl>
                  <FormDescription>Your current trading account balance. Used for risk assessment.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tradeHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><BookOpen size={16}/> Trade History Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Profitable in tech stocks, cautious with volatile assets." {...field} />
                  </FormControl>
                  <FormDescription>A brief summary of your trading history/style. Used for risk assessment.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marketConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><ThermometerSnowflake size={16}/> Current Market Conditions</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select market conditions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_MARKET_CONDITIONS_OPTIONS.map(condition => (
                        <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Your assessment of the current market. Used for risk assessment.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full md:w-auto">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
